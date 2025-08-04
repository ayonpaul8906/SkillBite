import os
import json
import re
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

GROQ_MODEL = "llama-3.3-70b-versatile" 

def extract_json_from_response(text):
    match = re.search(r"```json\s*(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1)
    else:
        return text
    

def validate_links(resources):
    valid = []
    for res in resources:
        try:
            r = requests.head(res["link"], timeout=5, allow_redirects=True)
            if r.status_code == 200:
                valid.append(res)
            else:
                print(f"⚠️ Invalid link (status {r.status_code}): {res['link']}")
        except Exception as e:
            print(f"❌ Error checking link {res['link']}: {e}")
    return valid


def generate_learning_resources(user_skills, user_goal):
    # First, get recommendations from LLM without YouTube links
    prompt = f"""
You are an AI career coach helping users upskill quickly.

The user has the following skills: {user_skills}
Their career goal is: {user_goal}

1. Start with a **brief career summary**: Explain what the role involves, the industries it fits in, and typical responsibilities.
2. Then give **future scope**: Mention demand trends, salary expectations, and why this role is promising.
3. Estimate a **probability (in %)** of landing a job in this career goal within 6 months if the user completes the recommended learning resources (based on current market trends).

Then recommend **5 to 7 high-quality, bite-sized learning resources** (tutorials, articles, or videos). Prioritize:
- **5 YouTube videos** around the topic and enhancements of skills for the career goal
- **2-3 articles** from verified sources:
    - https://developer.mozilla.org
    - https://www.freecodecamp.org
    - https://www.w3schools.com
    - https://realpython.com
    - https://geeksforgeeks.org

For each resource, include:
- title
- brief summary (2-3 lines)
- link (for articles only, leave empty for YouTube videos)
- duration (in minutes)
- topic
- recommended next step after this resource
- type (either "youtube" or "article")

Format the output as a **JSON object** with:
{{
  "career_summary": "...",
  "future_scope": "...",
  "job_success_probability": "...",
  "resources": [ ... list of 7-10 resources ... ]
}}
"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an AI assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        cleaned_json = extract_json_from_response(content)
        
        # Parse the JSON response
        recommendations = json.loads(cleaned_json)
        
        # Process resources to add real YouTube videos
        processed_resources = []
        youtube_topics = []
        
        print(f"🔍 Processing {len(recommendations.get('resources', []))} resources...")
        
        for i, resource in enumerate(recommendations.get("resources", [])):
            print(f"Resource {i+1}: {resource.get('title', 'No title')} - Type: {resource.get('type', 'No type')}")
            
            # Check if it's a YouTube resource (either by type or by checking if link is empty)
            if (resource.get("type") == "youtube" or 
                (not resource.get("link") and "youtube" in resource.get("title", "").lower())):
                topic = resource.get("topic", "")
                if topic:
                    youtube_topics.append(topic)
                    print(f"  📺 Added YouTube topic: {topic}")
                else:
                    # If no topic, use title as topic
                    title = resource.get("title", "")
                    youtube_topics.append(title)
                    print(f"  📺 Using title as YouTube topic: {title}")
            else:
                # Keep articles as they are
                processed_resources.append(resource)
                print(f"  📄 Added article: {resource.get('title', 'No title')}")
        
        print(f"🎯 Found {len(youtube_topics)} YouTube topics to search for")
        
        # Fetch real YouTube videos for collected topics
        for topic in youtube_topics:
            try:
                print(f"🔍 Searching YouTube for: {topic}")
                youtube_videos = search_youtube(topic, max_results=1)
                if youtube_videos:
                    processed_resources.append(youtube_videos[0])
                    print(f"  ✅ Found YouTube video: {youtube_videos[0]['title']}")
                else:
                    # If YouTube search fails, create a fallback resource
                    fallback_resource = {
                        "title": f"Learn {topic} on YouTube",
                        "summary": f"Search for '{topic}' tutorials on YouTube to find the best learning resources.",
                        "link": f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}",
                        "duration": "Varies",
                        "topic": topic,
                        "recommended_next_step": "Search and watch relevant tutorials",
                        "type": "youtube"
                    }
                    processed_resources.append(fallback_resource)
                    print(f"  ⚠️ Created fallback for: {topic}")
            except Exception as e:
                print(f"❌ Error fetching YouTube videos for topic '{topic}': {e}")
                # Add fallback resource
                fallback_resource = {
                    "title": f"Learn {topic} on YouTube",
                    "summary": f"Search for '{topic}' tutorials on YouTube to find the best learning resources.",
                    "link": f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}",
                    "duration": "Varies",
                    "topic": topic,
                    "recommended_next_step": "Search and watch relevant tutorials",
                    "type": "youtube"
                }
                processed_resources.append(fallback_resource)
                print(f"  ⚠️ Created error fallback for: {topic}")
        
        # Update the recommendations with processed resources
        recommendations["resources"] = processed_resources
        
        print(f"🎉 Final result: {len(processed_resources)} resources processed")
        
        return json.dumps(recommendations)
        
    except Exception as e:
        print(f"❌ Error in generate_learning_resources: {e}")
        return str(e)


import requests

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def search_youtube(query, max_results=3):
    print(f"🎬 Starting YouTube search for: '{query}'")
    
    if not YOUTUBE_API_KEY:
        print("❌ No YouTube API key found!")
        return []
    
    # First, search for videos
    search_url = "https://www.googleapis.com/youtube/v3/search"
    search_params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "key": YOUTUBE_API_KEY,
        "maxResults": max_results,
        "videoDuration": "medium",  # Prefer medium length videos (4-20 minutes)
        "videoEmbeddable": "true",
        "order": "relevance"
    }
    
    try:
        print(f"🔍 Making search request to YouTube API...")
        response = requests.get(search_url, params=search_params)
        response.raise_for_status()
        search_data = response.json()
        videos = search_data.get("items", [])
        
        print(f"📊 Search returned {len(videos)} videos")
        
        if not videos:
            print("⚠️ No videos found in search results")
            return []
        
        # Get video IDs for detailed info
        video_ids = [video["id"]["videoId"] for video in videos]
        print(f"🎥 Video IDs: {video_ids}")
        
        # Get detailed video information including duration
        details_url = "https://www.googleapis.com/youtube/v3/videos"
        details_params = {
            "part": "snippet,contentDetails,statistics",
            "id": ",".join(video_ids),
            "key": YOUTUBE_API_KEY
        }
        
        print(f"🔍 Getting detailed video information...")
        details_response = requests.get(details_url, params=details_params)
        details_response.raise_for_status()
        video_details = details_response.json().get("items", [])
        
        print(f"📊 Got details for {len(video_details)} videos")
        
        results = []
        for video in video_details:
            video_id = video["id"]
            snippet = video["snippet"]
            content_details = video["contentDetails"]
            
            # Convert ISO 8601 duration to minutes
            duration_str = content_details.get("duration", "PT0M")
            duration_minutes = parse_duration(duration_str)
            
            print(f"⏱️ Video duration: {duration_str} = {duration_minutes} minutes")
            
            # Filter out very short or very long videos
            if duration_minutes < 2 or duration_minutes > 60:
                print(f"⏭️ Skipping video (duration {duration_minutes} minutes): {snippet['title']}")
                continue
                
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            
            # Create a more educational-focused title
            title = snippet["title"]
            if "tutorial" not in title.lower() and "learn" not in title.lower():
                title = f"Learn {query} - {title}"
            
            result = {
                "title": title,
                "summary": snippet["description"][:200] + "..." if len(snippet["description"]) > 200 else snippet["description"],
                "link": video_url,
                "duration": f"{duration_minutes} minutes",
                "topic": query,
                "recommended_next_step": "Watch and practice along",
                "type": "youtube"
            }
            
            results.append(result)
            print(f"✅ Added video: {title}")
        
        print(f"🎉 YouTube search completed. Found {len(results)} valid videos")
        return results
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP Error in YouTube API: {e}")
        if e.response.status_code == 403:
            print("🔑 This might be a quota exceeded or API key issue")
        return []
    except Exception as e:
        print(f"❌ Error fetching YouTube videos: {e}")
        return []

def parse_duration(duration_str):
    """Convert ISO 8601 duration to minutes"""
    import re
    
    # Parse PT4M13S format
    time_match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
    if time_match:
        hours = int(time_match.group(1) or 0)
        minutes = int(time_match.group(2) or 0)
        seconds = int(time_match.group(3) or 0)
        return hours * 60 + minutes + (seconds / 60)
    return 0

def test_youtube_api():
    """Test if YouTube API key is working"""
    if not YOUTUBE_API_KEY:
        print("❌ YouTube API key not found in environment variables")
        return False
    
    try:
        # Test with a simple search
        print("🧪 Testing YouTube API...")
        test_videos = search_youtube("python tutorial", max_results=1)
        if test_videos:
            print("✅ YouTube API is working correctly")
            print(f"Sample video: {test_videos[0]['title']}")
            print(f"Sample link: {test_videos[0]['link']}")
            return True
        else:
            print("⚠️ YouTube API returned no results (might be quota exceeded)")
            return False
    except Exception as e:
        print(f"❌ YouTube API test failed: {e}")
        return False

# Test YouTube API on module load
if __name__ == "__main__":
    print("🚀 Testing YouTube API functionality...")
    test_youtube_api()