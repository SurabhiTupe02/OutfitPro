const OpenAIApi = require("openai"); // Import the OpenAI library
const { processImages } = require("./utils/processImages.js");
require("dotenv").config({ path: `${__dirname}/../.env` });
// Initialize the OpenAI API client
const openai = new OpenAIApi({ apiKey: '************** Your api Key **************' });

const analyzer = async (req, res) => {
  const selectedstyle = req.body.style;
  console.log("=========================> Inside analyzer.js and req.body.style = ", req.body.style)

  const imageUrls = await processImages(req);
  // console.log("=========================>  imageUrls = ", imageUrls)

  const formatExample = JSON.stringify([
    {
      outfit_id: 0,
      clothes: ["image1", "image2", "image3"],
      score: 10,  
      considerations: "",
    },
  ]);
  const textContent = `I have a collection of images encoded in base64, they are ${imageUrls}, each showing a different piece of clothing. I need to create multiple outfits for a 25 to 30-year-old female in a ${selectedstyle} style. Based on these images, first analyze the images based on color, style, texture, then mix and match these clothes to form 1-5 outfits. Each outfit should be a combination of 2 to 4 pieces.\nFor each outfit, provide a list that includes:\n- An outfit identifier (outfit_id) (auto-generated)\n- A list of clothes_id you selected for this outfit, the clothes_id is the 0-based index of the image provided in the collection, in format of image+index\n - A score from 0 to 10, reflecting how well the outfit matches the ${selectedstyle} style.\n - A short description about your rationales for this outfit. Your output should be JSON , in following format\n ${formatExample}.`;

  const imagesContent = imageUrls.map((url) => ({
    type: "image_url",
    image_url: {
      url: url,
      detail: "low",
    },
  }));



  const message = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: textContent,
        },
        ...imagesContent,
      ],
    },
  ];

  // console.log(JSON.stringify(message));

  try {
    console.log("=======================> Waiting for the request to get processed by gpt4 ......")
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: message,
    });
    console.log('========================> Getting text prompt response: ', response.choices[0]);
    console.log("=================================> Exiting out of analyzer.js with success !!! ")
    res.status(200).json(response.choices[0]);
  }
  catch (error) {
    console.error(error);
    res.status(400).json({ message: `Error calling gpt4 api: ${error}` });
  }
};

module.exports = { analyzer };