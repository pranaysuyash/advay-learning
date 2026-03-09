/**
 * Fallback Stories Data - Embedded story library for offline/LLM-failure scenarios
 * 
 * Stories are embedded in TypeScript to avoid JSON import issues
 * and ensure they're always available.
 */

export interface FallbackStory {
  id: string;
  theme: string;
  ageRange: [number, number];
  title: string;
  text: string;
}

export const fallbackStories: FallbackStory[] = [
  {
    id: "story_tiger_001",
    theme: "tiger",
    ageRange: [3, 5],
    title: "Raju's First Roar",
    text: "Once upon a time, in a lush green jungle in India, there lived a little tiger named Raju. Raju had bright orange stripes and a curious smile. He wanted to roar like his Papa tiger, but when he tried, only a tiny 'meow' came out! Raju practiced every day. He roared at the monkeys, he roared at the birds, and he even roared at his own reflection in the river. One day, a little bunny was lost and scared. Raju took a deep breath and gave his biggest roar ever: 'ROAAAR!' The bunny felt safe because Raju's roar was so brave. From that day, Raju knew that being brave is what makes a real tiger, not just a big roar."
  },
  {
    id: "story_tiger_002",
    theme: "tiger",
    ageRange: [6, 8],
    title: "The Tiger Who Loved to Paint",
    text: "Deep in the Sundarbans mangrove forest, there lived a tiger named Kesari who was different from all other tigers. While his brothers and sisters hunted and pounced, Kesari loved to dip his paws in colorful mud and paint on the smooth tree bark. The other animals laughed. 'Tigers don't paint!' said the monkeys. But Kesari didn't stop. He painted the golden sunrise, the purple twilight, and the green forest. One day, the forest had a great flood. The animals were scared and sad. Kesari painted a beautiful mural showing the forest at peace again. When the animals saw his painting, they felt hopeful. They realized that being different is special. Kesari became the forest's artist, and his paintings brought joy to everyone."
  },
  {
    id: "story_elephant_001",
    theme: "elephant",
    ageRange: [3, 5],
    title: "Ella's Long Trunk",
    text: "Little Ella the elephant had a very long trunk. Sometimes it got in the way! When she tried to drink water, her trunk made big bubbles. When she tried to eat bananas, her trunk knocked them down. Ella felt sad. But one day, her friend Mini the mouse fell into a deep hole. All the animals tried to help but couldn't reach. Ella lowered her long, long trunk into the hole. Mini climbed up safely! 'Your trunk is amazing!' said Mini. Ella smiled. She learned that what makes us different also makes us special. Now she loves her long trunk and all the wonderful things it can do!"
  },
  {
    id: "story_elephant_002",
    theme: "elephant",
    ageRange: [6, 8],
    title: "The Elephant Who Remembered Everything",
    text: "In a village near the Western Ghats, there lived an old elephant named Gajendra. The villagers called him 'the Memory Keeper' because Gajendra never forgot anything. He remembered where the sweetest mangoes grew. He remembered which paths were safe during monsoon. He remembered every person who had been kind to him. When young elephants got lost, Gajendra remembered the way home. When the river changed its course, Gajendra remembered where the old crossing was. One terrible year, there was a drought. The village wells dried up. But Gajendra remembered a hidden spring from fifty years ago. He led the villagers through the dry forest, and they found water! The village was saved. Everyone celebrated Gajendra and his amazing memory. They learned that old friends have the best wisdom."
  },
  {
    id: "story_bird_001",
    theme: "bird",
    ageRange: [3, 5],
    title: "The Little Bird Who Couldn't Sing",
    text: "Chiku was a small sparrow who lived in a mango tree. All his brothers and sisters could sing beautiful songs. But when Chiku tried, only a little 'squeak' came out! Chiku felt sad. He wanted to join the morning chorus. Every day, Chiku practiced. He listened to the wind whistling through leaves. He listened to the river bubbling. He listened to his own heartbeat. One morning, as the sun rose pink and gold, Chiku opened his beak. Out came the most magical sound - not like other birds, but like wind and water and morning sunshine all together! The other birds stopped singing to listen. 'What a wonderful sound!' they said. Chiku learned that everyone has their own special song inside them."
  },
  {
    id: "story_lion_001",
    theme: "lion",
    ageRange: [4, 6],
    title: "The Lion Who Was Afraid of the Dark",
    text: "Sheru was the bravest lion in the whole jungle during the day. He could chase away naughty monkeys. He could protect the little animals. He could roar louder than thunder! But when the sun went down and the stars came out, Sheru felt scared. The dark shadows looked like monsters. The rustling leaves sounded like ghosts. Sheru would hide in his cave and tremble. One night, little Mira the mouse saw Sheru shaking. 'I'm scared of the dark too,' said Mira. 'But look - the stars are like little night-lights. The moon is our friend. And shadows are just trees sleeping.' Sheru looked up. The stars did look like friendly eyes watching over him. The moon was like a big night-light. He wasn't alone. From that night, Sheru and Mira would sit together and watch the stars. Sheru learned that being brave doesn't mean never being scared. It means having friends who help you feel safe."
  },
  {
    id: "story_monkey_001",
    theme: "monkey",
    ageRange: [3, 5],
    title: "Momo the Monkey's Big Mistake",
    text: "Momo the monkey loved mangoes. One day, he saw the biggest, juiciest mango ever hanging from the highest branch. Momo climbed and climbed. He reached for the mango... but it was too far! Momo stretched and stretched until - SNAP! - the branch broke! Down tumbled Momo, right into the river! Splash! Momo was wet and embarrassed. The wise old owl said, 'Momo, it's okay to want things. But next time, ask for help or find another way.' Momo thought about this. The next day, he saw another big mango. This time, he asked his friend Koko to hold the branch. Together, they got the mango! Momo learned that asking for help makes us stronger, not weaker. And sharing the mango with Koko made it taste even sweeter!"
  },
  {
    id: "story_fish_001",
    theme: "fish",
    ageRange: [4, 6],
    title: "The Fish Who Wanted to Fly",
    text: "Deep in the Indian Ocean, there lived a little fish named Tara. Tara loved to watch the birds flying above the water. 'I wish I could fly too!' she said. The other fish laughed. 'Fish can't fly! Fish swim!' But Tara didn't give up. She practiced jumping higher and higher out of the water. She watched how birds moved their wings. She practiced flipping and twisting. One day, a big wave came. Tara jumped at just the right moment - whoosh! She flew through the air, over the wave, doing flips and twists! For a moment, she was flying! The other fish gasped. 'You're flying!' they cheered. Tara splashed back down, laughing. She learned that even if you can't do something the same way as others, you can find your own special way. Now Tara is famous for her flying jumps, and all the little fish practice jumping just like her!"
  },
  {
    id: "story_rainbow_001",
    theme: "rainbow",
    ageRange: [3, 5],
    title: "Where Do Rainbows Sleep?",
    text: "Little Anju loved rainbows. After every rain, she would look for the colorful arc in the sky. 'Mama, where do rainbows sleep at night?' she asked. Mama smiled. 'Would you like to find out?' That evening, as the sun began to set, Mama took Anju to the garden. The sprinkler was making tiny water drops in the air. The setting sun shone through them. 'Look!' said Mama. A tiny rainbow appeared right in their garden! Anju saw that rainbows appear when sunlight plays with water drops. 'So rainbows don't sleep,' said Anju. 'They just wait for sun and rain to dance together!' Mama hugged her. 'That's right, my clever girl. Magic is just science waiting to be understood.' Now whenever Anju sees a rainbow, she remembers that wonderful evening in the garden with Mama."
  },
  {
    id: "story_star_001",
    theme: "star",
    ageRange: [4, 7],
    title: "The Little Star Who Was Afraid to Shine",
    text: "High up in the night sky, there lived a little star named Twinkle. Twinkle was very shy. All the other stars shone so bright and beautiful. But Twinkle thought her light was too small and dim. 'No one will notice me anyway,' she whispered. So Twinkle hid behind the big clouds and hardly shone at all. Down on Earth, a little girl named Priya couldn't sleep. She looked out her window. The sky was dark because the clouds covered most stars. But then - was that a tiny glimmer? Priya looked closer. Yes! A little star was peeking through the clouds. That tiny light made Priya smile. She felt peaceful and fell asleep. Up in the sky, the Moon saw this. 'Twinkle,' said the Moon, 'do you know who just fell asleep because of your light? A little girl who was scared of the dark. Your light, even small, is important.' Twinkle felt warm and happy inside. She came out from behind the clouds and shone her brightest. She learned that no light is too small to help someone. Now Twinkle shines every night, and she helps many children feel safe in the dark."
  },
  {
    id: "story_adventure_001",
    theme: "adventure",
    ageRange: [5, 8],
    title: "The Map in the Mango Tree",
    text: "Arun and his sister Leela loved exploring their grandmother's village in Kerala. One summer day, they found something strange carved into the old mango tree in the backyard - a map! The map showed the way to 'The Hidden Treasure of the Wise Ones.' The children were excited! They followed the map through the paddy fields, past the temple, over the little stream, and into the bamboo grove. At each spot, they found a riddle. 'I have cities but no houses,' said one riddle. 'A map!' shouted Arun. 'I have mountains but no trees,' said another. 'Also a map!' laughed Leela. Finally, they reached an ancient banyan tree. There, in a hollow, they found a box. Inside were old books - stories, poems, and wisdom written by their own ancestors! The real treasure was knowledge passed down through generations. Arun and Leela spent the whole summer reading the books and learning from the wise words of their family. They learned that the best adventures are the ones that teach us something new."
  },
  {
    id: "story_friendship_001",
    theme: "friendship",
    ageRange: [3, 6],
    title: "The Peacock and the Crow",
    text: "Mohan the peacock had the most beautiful feathers in the whole forest. When he danced, his tail opened like a rainbow fan. All the animals clapped and cheered. But Mohan was proud and didn't want to be friends with anyone. 'I'm too beautiful for simple friends,' he said. Kaku the crow was simple and black. But Kaku was kind. When Mohan got stuck in a thorn bush, everyone was afraid to help. 'Those feathers might get ruined!' they said. But Kaku flew in and carefully pulled out each thorn with his beak. It took a long time and hurt a little, but Kaku didn't stop. When Mohan was free, he looked at his feathers. A few were lost, but he was safe. 'You helped me even though I'm not beautiful right now,' said Mohan. 'True friendship isn't about being beautiful,' said Kaku. 'It's about being there when someone needs you.' Mohan learned his lesson. He stopped being proud and became friends with everyone, especially Kaku. Now Mohan dances for all his friends, and Kaku always sits in the front row, clapping the loudest."
  },
  {
    id: "story_kindness_001",
    theme: "kindness",
    ageRange: [4, 7],
    title: "The Girl Who Shared Her Tiffin",
    text: "Every day, Ananya's mother packed her the most delicious tiffin for school - parathas, pickles, fruits, and sometimes a sweet treat. Ananya loved her lunch. But she noticed something. Her classmate Ravi never brought tiffin. He would sit quietly during lunch break, pretending to read. One day, Ananya's mother packed an extra paratha. 'For a friend,' she said with a smile. At lunch time, Ananya sat next to Ravi. 'I have too much food today,' she said. 'Will you help me eat it?' Ravi looked surprised, then grateful. They shared the lunch together. Ravi told Ananya that his mother was sick and his father worked far away. No one was home to make his lunch. From that day, Ananya always brought extra. Sometimes other classmates joined in too. Soon, there was a 'sharing table' in their classroom where everyone brought a little extra. No one ever ate alone. Ananya learned that the smallest act of kindness can grow into something wonderful. And the food always tasted better when shared with friends."
  },
  {
    id: "story_bravery_001",
    theme: "bravery",
    ageRange: [5, 8],
    title: "The Boy Who Spoke Up",
    text: "Rohan was quiet and shy. He loved his school, his books, and his small group of friends. But there was a problem. Some older students were bullying a new boy, Aman. They would push him, take his things, and say mean things. Everyone saw it, but no one said anything. They were scared. Rohan was scared too. His stomach felt tight when he saw Aman being bullied. One day, the bullies took Aman's lunch and threw it in the dustbin. Aman's eyes filled with tears. Rohan felt something snap inside him. He walked up to the bullies. His legs were shaking, but his voice was steady. 'Stop it,' he said. 'Leave Aman alone.' The bullies laughed. 'Or what?' they said. Rohan took a deep breath. 'Or I will tell the principal. And I will tell your parents. And I will keep telling until you stop.' Other students started gathering around. 'Yes, we'll tell too!' they said. The bullies looked around, then ran away. Aman thanked Rohan with tears in his eyes. 'You were so brave,' he said. Rohan smiled shakily. 'I was scared the whole time,' he admitted. 'But I was more scared of being someone who just watches.' The teachers heard about it and started an anti-bullying club. Rohan became its leader. He learned that bravery isn't about not being scared. It's about doing what's right even when you are scared."
  },
  {
    id: "story_nature_001",
    theme: "nature",
    ageRange: [4, 7],
    title: "The Seed's Long Journey",
    text: "Little Tara was a tiny seed from a neem tree. One day, the wind came and whispered, 'Want to go on an adventure?' Tara was scared but excited. 'Yes!' she said. The wind lifted her up, up, up! She flew over rivers, over mountains, over cities. She saw so many things - waterfalls that looked like silver ribbons, clouds that looked like cotton candy, and forests that looked like green oceans. Sometimes the wind dropped her, and she rolled along the ground. Sometimes rain washed her along streams. She met other travelers - a butterfly going to find flowers, a dandelion seed floating like a tiny parachute, a bird flying south for winter. After many days, Tara landed in a patch of soft soil. A little girl named Priya was planting a garden there. She found Tara and gently pushed her into the earth. 'Grow, little seed,' said Priya. Tara felt warm and safe. She drank water and grew roots. Months passed. Tara grew into a strong little plant. Years passed. Tara grew into a big neem tree. Birds made nests in her branches. Children played in her shade. And every year, when the wind came, Tara would release her own little seeds to go on adventures. She remembered her journey and smiled. Being a tree was wonderful, but having an adventure first made her appreciate it even more."
  },
  {
    id: "story_family_001",
    theme: "family",
    ageRange: [3, 6],
    title: "Dadi's Magic Box",
    text: "Every Sunday, Priya and her brother Arjun visited their Dadi (grandmother). Dadi had a special wooden box that she kept on the highest shelf. 'What's in the magic box?' the children would ask. 'Memories,' Dadi would smile. One rainy Sunday, Dadi brought the box down. She opened it slowly. Inside were old photographs, letters, and small treasures. 'This,' said Dadi, holding up a photo, 'is your Papa when he was your age. See how he loved climbing trees?' She showed them a letter their father wrote when he was six. 'To my Mummy, I love you. You make the best kheer.' The children laughed. Dadi showed them her own mother's bangles, her father's spectacles, her wedding invitation. Each item had a story. 'This box,' said Dadi, 'holds our family's love through time. When you keep memories safe, love never fades.' Priya had an idea. She ran to her bag and took out a drawing she made at school. 'Dadi, can this go in the magic box too?' Dadi's eyes sparkled with happy tears. 'Yes, my darling. Yes.' She placed the drawing carefully inside. 'One day, you will show this to your grandchildren, and tell them about your Dadi.' Priya hugged her tight. She learned that families are connected by stories and memories, and that grandmothers are the keepers of the most precious magic of all."
  }
];

export default fallbackStories;
