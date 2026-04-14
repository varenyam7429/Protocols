import axios from "axios";

const API_KEY = "ZG1GeVpXNTVZVzF6YUdGeWJXRTRNVFJBWjIxaGFXd3VZMjl0Ok9zMXZzSUl0WjFYTWd2VkVSNXh2OA=="; // replace this
const D_ID_URL = "https://api.d-id.com/talks";

// ✅ CREATE VIDEO
export async function createAvatarVideo(audioUrl) {
  try {
    const res = await axios.post(
      D_ID_URL,
      {
        source_url:"https://images.squarespace-cdn.com/content/v1/631ba8eed2196a6795698665/3690ca61-6a9d-4c93-a2a5-83a5f2aa1648/2022-08-16-Trinet-0540-Martinez-Juan.jpg",
        script: {
          type: "audio",
          audio_url: "https://res.cloudinary.com/de0sl1ckm/video/upload/v1775975067/Recording_ribnbj.mp4"
        }
      },
      {
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data.id;

  } catch (err) {
    console.error("D-ID Create Error:", err.message);
    return null;
  }
}

// ✅ GET VIDEO
export async function getAvatarVideo(id) {
  try {
    const res = await axios.get(
      `https://api.d-id.com/talks/${id}`,
      {
        headers: {
          Authorization: API_KEY
        }
      }
    );

    return res.data;

  } catch (err) {
    console.error("D-ID Fetch Error:", err.message);
    return null;
  }
}