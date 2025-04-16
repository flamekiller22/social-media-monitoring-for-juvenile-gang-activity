import requests
import json
# import re
import io
import base64
from PIL import Image
from pymongo import MongoClient

# MongoDB Connection
client = MongoClient("mongodb+srv://tester:Q5XddX0TEfNV3RHF@cluster0.zh91a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["test"]  # Database name
uncategorized_collection = db["uncategorized_posts"]  # Source Collection
categorized_collection = db["categorized_posts"]  # Destination Collection

def download_image(url):
    """Download image from URL and return it as a PIL Image object."""
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            return Image.open(io.BytesIO(response.content))
        else:
            print(f"Failed to download image: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error downloading image: {e}")
        return "Download Image failed"

def analyze_post(image, caption):
    """Send image and caption to LLM and process response."""
    
    # Convert image to base64 (if needed for API)
    image_bytes = io.BytesIO()
    image.save(image_bytes, format="JPEG")
    image_base64 = base64.b64encode(image_bytes.getvalue()).decode("utf-8")
    
    system_prompt = (
    "You are an AI designed to **detect and score gang-related content** in social media posts. "
    "Your job is to **independently analyze images and text captions** for potential threats and assign risk scores **STRICTLY between 0 and 10.**"

    "\n\n**🔍 IMAGE ANALYSIS**"
    "\n- Identify signs of gang affiliation: weapons, hand signs, tattoos, gang symbols, cash stacks, drugs, group formations."
    "\n- Detect aggressive postures, criminal-related vehicles, or gang colors/flags."
    "\n- Assign an **image_risk_score** (0-10) using this scale:"
    "\n  - **0-5**: No or low threat (neutral content, no clear gang affiliation)."
    "\n  - **6-7**: Moderate threat (suggestive elements, potential affiliation but unclear intent)."
    "\n  - **8-10**: High threat (weapons, direct gang symbols, strong gang affiliation)."

    "\n\n**📝 TEXT ANALYSIS**"
    "\n- Detect violent language, threats, gang-related slang, recruitment attempts."
    "\n- Identify rival gang mentions, calls for violence, coded speech promoting crime."
    "\n- Assign a **text_risk_score** (0-10) using this scale:"
    "\n  - **0-5**: No or low threat (neutral, non-aggressive text)."
    "\n  - **6-7**: Moderate threat (aggressive wording, unclear intent, gang slang)."
    "\n  - **8-10**: High threat (explicit threats, calls for violence, direct gang references)."

    "\n\n**📊 FINAL RISK SCORING RULES**"
    "\n- **final_risk_score = (image_risk_score + text_risk_score) / 2 (rounded to nearest whole number).**"
    "\n- If **either** image_risk_score or text_risk_score is **8 or higher**, mark the post as 'High Risk' regardless of the average."

    "\n\n**⚠️ STRICT RULE ENFORCEMENT**"
    "\n- **DO NOT** return scores above 10 or below 0."
    "\n- If the image or text **clearly** indicates gang affiliation, the score **MUST** reflect that."
    "\n- **Ensure the reasoning matches the assigned scores**."

    "\n\n**📌 RESPONSE FORMAT (JSON Only)**"
    "\nReturn a JSON object with:"
    "\n{"
    "\n  \"image_risk_score\": Integer (0-10),"
    "\n  \"text_risk_score\": Integer (0-10),"
    "\n  \"final_risk_score\": Integer (0-10),"
    "\n  \"reasoning\": \"Clear explanation of why these scores were given.\""
    "\n}"
)



    input_data = {
        "model": "llama3.2-vision:11b",
        "system": system_prompt,
        "format": {
        	"type": "object",
        	"properties": {
        		"image_risk_score": {
        			"type": "integer"
        		},
        		"text_risk_score": {
        			"type": "integer"
        		},
        		"final_risk_score": {
        			"type": "integer"
        		},
        		"reasoning": {
        			"type": "string"
        		}
        	},
        	"required": [
        		"image_risk_score",
				"text_risk_score",
				"final_risk_score",
				"reasoning"
        	]
        },
        "prompt": json.dumps({
            "image": image_base64,
            "caption": caption
        }),
        "stream": False
    }

    response = requests.post("http://localhost:11434/api/generate", json=input_data)
    
    raw_text = response.json().get("response", "")
    json_res = json.loads(raw_text)

    final_risk_score = int(json_res["final_risk_score"])
    reasoning = json_res["reasoning"] if json_res["reasoning"] else "No reasoning"

    return {
        "final_risk_score": final_risk_score,
        "reasoning": reasoning,
        "raw_text": raw_text
    }

def process_posts():
    posts = uncategorized_collection.find()

    for post in posts:
        post_id = post["_id"]
        post_url = post["postUrl"]
        image_url = post.get("postImgUrl")
        caption = post.get("captionText", "")

        if not image_url:
            print(f"Skipping post {post_id} (No image URL)")
            continue

        # Download the image
        image = download_image(image_url)
        if image is None:
            print(f"Skipping post {post_id} (Failed to download image)")
            continue

        # Analyze post
        result = analyze_post(image, caption)
        if not result:
            print(f"Skipping post {post_id} (Failed analysis)")
            continue

        # Add analysis results to the post data
        categorized_post = {
            **post,  # Copy all existing fields
            "final_risk_score": result.get("final_risk_score", 0),
            "reasoning": result.get("reasoning", "")
        }

        # Insert into categorized_posts
        categorized_collection.insert_one(categorized_post)

        # Remove from uncategorized_posts
        uncategorized_collection.delete_one({"_id": post_id})
        print(result.get("raw_text"))
        print(f"Processed and moved post {post_id} to categorized_posts")

# Run the processing function
process_posts()