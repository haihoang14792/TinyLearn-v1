import { GoogleGenAI } from '@google/genai';

function buildFallbackChoices(targetName: string, count: number, suggestedSvgKey: string, bgColor: string) {
  const safeCount = Math.max(2, Math.min(count || 2, 6));
  const pool = [
    { name: 'Quả Chuối', key: 'banana', bg: '#FEF9C3' },
    { name: 'Quả Táo', key: 'apple', bg: '#FEE2E2' },
    { name: 'Quả Cam', key: 'orange', bg: '#FFEDD5' },
    { name: 'Bạn Mèo', key: 'cat', bg: '#FFF7ED' },
    { name: 'Bạn Chó', key: 'dog', bg: '#FEF3C7' },
    { name: 'Quả Dưa Hấu', key: 'watermelon', bg: '#DCFCE7' },
  ];

  const choices: any[] = [
    {
      id: `choice_correct_${Date.now()}_0`,
      name: targetName,
      label: targetName,
      imageUrl: '',
      suggestedSvgKey: suggestedSvgKey || 'star',
      bgColor: bgColor || '#FEF3C7',
      isCorrect: true,
    },
  ];

  const distractors = pool.filter(
    (p) => !targetName.toLowerCase().includes(p.name.toLowerCase()) && !p.name.toLowerCase().includes(targetName.toLowerCase())
  );

  for (let i = 0; i < safeCount - 1; i++) {
    const item = distractors[i % distractors.length];
    choices.push({
      id: `choice_distractor_${Date.now()}_${i + 1}`,
      name: item.name,
      label: item.name,
      imageUrl: '',
      suggestedSvgKey: item.key,
      bgColor: item.bg,
      isCorrect: false,
    });
  }

  return choices;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      topic = 'Con vật đáng yêu',
      ageRange = '12–18 tháng',
      questionCount = 4,
      gameType = 'listen_find',
      goal,
      choicesCount = 2,
      answerType = 'single',
      shuffleChoices = false,
    } = body;

    const safeChoicesCount = Math.max(2, Math.min(choicesCount || 2, 6));

    // Try Gemini API if key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Bạn là chuyên gia sư phạm mầm non Việt Nam. Hãy tạo trò chơi tương tác cho trẻ nhóm tuổi "${ageRange}".
Chủ đề: "${topic}".
Số câu hỏi: ${questionCount}.
Loại trò chơi: "${gameType}".
Mỗi câu hỏi PHẢI CÓ ĐÚNG ${safeChoicesCount} LỰA CHỌN TRONG MẢNG choices.

Trả về JSON duy nhất:
{
  "title": "Tên trò chơi",
  "topic": "${topic}",
  "ageRange": "${ageRange}",
  "gameType": "${gameType}",
  "choicesCount": ${safeChoicesCount},
  "items": [
    {
      "name": "Tên vật phẩm",
      "questionText": "Câu hỏi ngắn gọn",
      "readingSentence": "Câu đọc nhẹ nhàng",
      "movementSuggestion": "Gợi ý vận động",
      "choices": [
        { "name": "Lựa chọn 1", "isCorrect": true, "suggestedSvgKey": "cat" },
        { "name": "Lựa chọn 2", "isCorrect": false, "suggestedSvgKey": "dog" }
      ]
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            game: {
              ...parsed,
              id: `game_${Date.now()}`,
              choicesCount: safeChoicesCount,
              answerType,
              shuffleChoices,
            },
          });
        }
      } catch (geminiErr: any) {
        console.warn('[Vercel AI Game] Gemini error, using fallback:', geminiErr?.message);
      }
    }

    // High quality deterministic preschool fallback
    const items = [
      {
        id: `item_${Date.now()}_1`,
        name: 'Quả Chuối',
        questionText: 'Quả chuối đâu con nhỉ?',
        soundText: 'Chút chít',
        readingSentence: 'Đây là quả chuối chín vàng ngọt thơm.',
        movementSuggestion: 'Hai tay chụm lại hình quả chuối cong cong',
        praisePhrase: 'Bé giỏi quá! Đúng là quả chuối rồi!',
        encouragementPhrase: 'Con nhìn kỹ quả màu vàng cong cong nhé!',
        bgColor: '#FEF9C3',
        choices: buildFallbackChoices('Quả Chuối', safeChoicesCount, 'banana', '#FEF9C3'),
      },
      {
        id: `item_${Date.now()}_2`,
        name: 'Quả Táo',
        questionText: 'Đố bé quả táo đỏ ở đâu?',
        soundText: 'Giòn tan',
        readingSentence: 'Quả táo đỏ tròn xoe và mọng nước.',
        movementSuggestion: 'Xòe hai bàn tay tròn như quả táo',
        praisePhrase: 'Hoan hô! Bé tìm quả táo rất nhanh!',
        encouragementPhrase: 'Con chọn quả màu đỏ tròn xoe nào!',
        bgColor: '#FEE2E2',
        choices: buildFallbackChoices('Quả Táo', safeChoicesCount, 'apple', '#FEE2E2'),
      },
      {
        id: `item_${Date.now()}_3`,
        name: 'Bạn Mèo',
        questionText: 'Con gì kêu meo meo? Tìm bạn Mèo nào!',
        soundText: 'Meo meo',
        readingSentence: 'Bạn Mèo ngoan thích sưởi nắng ấm.',
        movementSuggestion: 'Hai tay vuốt má làm động tác mèo rửa mặt',
        praisePhrase: 'Tuyệt vời! Bé bắt chước bạn mèo rất khéo!',
        encouragementPhrase: 'Lắng nghe tiếng meo meo và chọn lại nhé!',
        bgColor: '#FFF7ED',
        choices: buildFallbackChoices('Bạn Mèo', safeChoicesCount, 'cat', '#FFF7ED'),
      },
    ].slice(0, questionCount);

    return res.json({
      game: {
        id: `game_${Date.now()}`,
        title: `Trò chơi: ${topic}`,
        topic,
        ageRange,
        gameType,
        choicesCount: safeChoicesCount,
        defaultChoiceCount: safeChoicesCount,
        answerType,
        shuffleChoices,
        items,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
