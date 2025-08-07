import os
import json
import re
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Helper to extract JSON from Gemini response
def extract_json_from_response(text):
    """Extract JSON from Gemini response, handling multiple formats"""
    if not text or not text.strip():
        return None
    
    # Try to find JSON block first
    json_match = re.search(r"```json\s*(.*?)```", text, re.DOTALL | re.IGNORECASE)
    if json_match:
        return json_match.group(1).strip()
    
    # Try to find content between curly braces
    brace_match = re.search(r"(\{.*\})", text, re.DOTALL)
    if brace_match:
        return brace_match.group(1).strip()
    
    # If the entire text looks like JSON, return it
    text = text.strip()
    if text.startswith('{') and text.endswith('}'):
        return text
    
    return None

def search_youtube(query, max_results=3):
    """Search YouTube and return actual video links"""
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
            
            result = {
                "title": snippet["title"],
                "summary": snippet["description"][:200] + "..." if len(snippet["description"]) > 200 else snippet["description"],
                "link": video_url,
                "duration": f"{duration_minutes} minutes",
                "topic": query,
                "recommended_next_step": "Watch and practice along",
                "type": "youtube"
            }
            
            results.append(result)
            print(f"✅ Added video: {snippet['title']}")
        
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

def generate_youtube_topics(user_skills, user_goal):
    """Generate YouTube search topics using Gemini"""
    prompt = f"""
Based on the user's skills: {user_skills}
And their career goal: {user_goal}

Generate 5 specific YouTube search topics that would help them learn the required skills. 
Make the topics specific and searchable (e.g., "Python data structures tutorial", "React hooks beginner guide").

Respond with ONLY a JSON array of strings, like this:
["topic 1", "topic 2", "topic 3", "topic 4", "topic 5"]
"""

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 500}
    }
    params = {"key": GEMINI_API_KEY}
    
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, params=params, json=payload)
        if response.status_code == 200:
            data = response.json()
            if "candidates" in data and data["candidates"]:
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Extract JSON array from response
                json_match = re.search(r'\[(.*?)\]', text, re.DOTALL)
                if json_match:
                    try:
                        topics = json.loads('[' + json_match.group(1) + ']')
                        return topics
                    except:
                        pass
        
        # Fallback topics if API fails
        return [
            f"{user_goal} tutorial",
            f"{user_goal} beginner guide", 
            f"{user_goal} crash course",
            f"Learn {user_goal}",
            f"{user_goal} fundamentals"
        ]
    except:
        return [
            f"{user_goal} tutorial",
            f"{user_goal} beginner guide", 
            f"{user_goal} crash course",
            f"Learn {user_goal}",
            f"{user_goal} fundamentals"
        ]

def generate_learning_resources(user_skills, user_goal):
    prompt = f"""
You are an AI career coach helping users upskill quickly.

The user has the following input:
- Skills: {user_skills}
- Career goal: {user_goal}

First, **validate the input**. If any of the following conditions are met:
- The user_skills or user_goal is nonsensical, made-up, gibberish (e.g., "asdfg", "banana dancing", "zzxcv"), too vague, or unrelated to real-world careers or skills
- The career goal is not identifiable as a real profession or learning path

Then respond with the following JSON format:
{{
"error": "Invalid input",
"message": "Please enter valid, real-world skills and a clear career goal."
}}

---

If the input is valid, continue with the following:

1. Provide a **brief career summary**: Describe what the role involves, the industries it fits in, and typical responsibilities.
2. Explain the **future scope**: Mention demand trends, salary expectations, and why this role is promising.
3. Estimate a **probability (in %)** of landing a job in this career goal within 6 months if the user completes the recommended learning resources (based on current market trends).

Then recommend **2-3 high-quality articles** from verified sources like:
- https://developer.mozilla.org
- https://www.freecodecamp.org
- https://www.w3schools.com
- https://realpython.com
- https://geeksforgeeks.org
- Make 100% sure that they are valid pages

For each article resource, include:
- title
- brief summary (2-3 lines)
- link (must be a valid URL from the approved sources above)
- duration (in minutes or 'Varies' if unknown)
- topic
- recommended_next_step after this resource
- type: "article"

Output only a number followed by `%`, like "job_success_probability": "65%"

**IMPORTANT: Respond ONLY with valid JSON. Do not include any explanation text before or after the JSON.**

Format the output as a **JSON object** like this:
{{
"career_summary": "...",
"future_scope": "...",
"job_success_probability": "...",
"resources": [ ... list of 2-3 article resources ... ]
}}
"""

    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048
        }
    }
    
    params = {"key": GEMINI_API_KEY}
    
    try:
        # Make API request
        response = requests.post(GEMINI_API_URL, headers=headers, params=params, json=payload)
        print("Gemini API status:", response.status_code)
        
        # Check for HTTP errors
        if response.status_code != 200:
            print("Gemini API error response:", response.text)
            return json.dumps({
                "error": "API request failed",
                "status_code": response.status_code,
                "message": "Failed to get response from Gemini API"
            })
        
        # Parse response
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            print("Failed to parse API response as JSON:", e)
            return json.dumps({
                "error": "Invalid API response",
                "exception": str(e),
                "raw_response": response.text[:500]  # First 500 chars for debugging
            })
        
        # Extract content from Gemini response
        if "candidates" not in data or not data["candidates"]:
            print("No candidates in API response:", data)
            return json.dumps({
                "error": "No content generated",
                "message": "Gemini API returned no candidates",
                "api_response": data
            })
        
        candidate = data["candidates"][0]
        if "content" not in candidate or "parts" not in candidate["content"]:
            print("Invalid candidate structure:", candidate)
            return json.dumps({
                "error": "Invalid response structure",
                "message": "Expected content and parts in API response"
            })
        
        text = candidate["content"]["parts"][0]["text"]
        print("Extracted text from Gemini:", text[:200] + "..." if len(text) > 200 else text)
        
        # Extract and parse JSON
        cleaned_json = extract_json_from_response(text)
        print("Extracted JSON string:", cleaned_json[:200] + "..." if cleaned_json and len(cleaned_json) > 200 else cleaned_json)
        
        if not cleaned_json:
            print("No JSON found in response")
            return json.dumps({
                "error": "No JSON found in response",
                "message": "Could not extract JSON from Gemini response",
                "raw_text": text[:500]  # First 500 chars for debugging
            })
        
        # Validate and parse JSON
        try:
            recommendations = json.loads(cleaned_json)
            
            # Now add YouTube videos using the YouTube API
            print("🎬 Adding YouTube videos...")
            youtube_topics = generate_youtube_topics(user_skills, user_goal)
            youtube_resources = []
            
            # Search for videos for each topic (limit to 1 video per topic to get 5 total)
            for topic in youtube_topics:
                videos = search_youtube(topic, max_results=1)
                youtube_resources.extend(videos)
            
            # Add YouTube resources to the recommendations
            if 'resources' not in recommendations:
                recommendations['resources'] = []
            
            recommendations['resources'].extend(youtube_resources)
            
            print(f"✅ Added {len(youtube_resources)} YouTube videos")
            return json.dumps(recommendations, indent=2)
            
        except json.JSONDecodeError as e:
            print("JSON parsing failed:", e)
            print("Raw JSON string:", cleaned_json)
            return json.dumps({
                "error": "Invalid JSON in response",
                "exception": str(e),
                "raw_json": cleaned_json[:500]  # First 500 chars for debugging
            })
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return json.dumps({
            "error": "Network error",
            "exception": str(e),
            "message": "Failed to connect to Gemini API"
        })
    except Exception as e:
        print(f"❌ Unexpected error in generate_learning_resources: {e}")
        return json.dumps({
            "error": "Unexpected error",
            "exception": str(e),
            "message": "An unexpected error occurred"
        })

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

# Test function for debugging
def test_learning_resources():
    """Test the learning resources generation"""
    print("🧪 Testing learning resources generation...")
    result = generate_learning_resources("Python, numpy, pandas", "ML engineer")
    print("Result:", result)
    return result

# Test on module load
if __name__ == "__main__":
    print("🚀 Testing functionality...")
    test_youtube_api()
    print("\n" + "="*50 + "\n")
    test_learning_resources()