#!/usr/bin/env python3
"""
Test script to debug YouTube API integration
"""

import os
from dotenv import load_dotenv
from groq import test_youtube_api, search_youtube, generate_learning_resources

load_dotenv()

def main():
    print("=" * 50)
    print("🧪 YouTube API Integration Test")
    print("=" * 50)
    
    # Test 1: Check if API key exists
    youtube_api_key = os.getenv("YOUTUBE_API_KEY")
    if youtube_api_key:
        print(f"✅ YouTube API key found: {youtube_api_key[:10]}...")
    else:
        print("❌ YouTube API key not found in .env file")
        return
    
    # Test 2: Test basic YouTube search
    print("\n" + "=" * 30)
    print("Test 2: Basic YouTube Search")
    print("=" * 30)
    
    test_result = test_youtube_api()
    
    if test_result:
        # Test 3: Test specific search
        print("\n" + "=" * 30)
        print("Test 3: Specific Search")
        print("=" * 30)
        
        videos = search_youtube("React tutorial for beginners", max_results=2)
        print(f"Found {len(videos)} videos for 'React tutorial for beginners'")
        
        for i, video in enumerate(videos):
            print(f"\nVideo {i+1}:")
            print(f"  Title: {video['title']}")
            print(f"  Link: {video['link']}")
            print(f"  Duration: {video['duration']}")
        
        # Test 4: Test full recommendation generation
        print("\n" + "=" * 30)
        print("Test 4: Full Recommendation Generation")
        print("=" * 30)
        
        result = generate_learning_resources("Python, JavaScript", "Full Stack Developer")
        
        try:
            import json
            parsed_result = json.loads(result)
            print("✅ Successfully generated recommendations")
            
            resources = parsed_result.get("resources", [])
            youtube_count = sum(1 for r in resources if r.get("type") == "youtube")
            article_count = sum(1 for r in resources if r.get("type") == "article")
            
            print(f"📊 Total resources: {len(resources)}")
            print(f"📺 YouTube videos: {youtube_count}")
            print(f"📄 Articles: {article_count}")
            
            # Show first few resources
            for i, resource in enumerate(resources[:3]):
                print(f"\nResource {i+1}:")
                print(f"  Title: {resource.get('title', 'No title')}")
                print(f"  Type: {resource.get('type', 'No type')}")
                print(f"  Link: {resource.get('link', 'No link')}")
                
        except Exception as e:
            print(f"❌ Error parsing result: {e}")
            print(f"Raw result: {result}")
    
    else:
        print("❌ YouTube API test failed. Check your API key and quota.")

if __name__ == "__main__":
    main() 