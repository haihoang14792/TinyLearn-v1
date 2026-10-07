import { GoogleGenAI } from '@google/genai';

function buildFallbackChoices(targetName: string, count: number, suggestedSvgKey: string, bgColor: string) {
  const safeCount = Math.max(2, Math.min(count || 2, 6));
  const pool = [
    { name: 'Quả Chuối', key: 'banana', bg: '#FEF9C3' },
    { name: 'Quả Táo', key: 'apple', bg: '#FEE2E2' },
    { name: 'Quả Cam', key: 'orange', bg: '#FFEDD5' },
    { name: 'Củ Cà Rốt', key: 'carrot', bg: '#FFEDD5' },
    { name: 'Bạn Mèo', key: 'cat', bg: '#FFF7ED' },
    { name: 'Bạn Chó', key: 'dog', bg: '#FEF3C7' },
    { name: 'Bạn Vịt', key: 'duck', bg: '#FEF9C3' },
    { name: 'Bạn Gà', key: 'chicken', bg: '#FDF2F8' },
    { name: 'Quả Dưa Hấu', key: 'watermelon', bg: '#DCFCE7' },
    { name: 'Xe Ô Tô', key: 'car', bg: '#E0F2FE' },
    { name: 'Bóng Tròn', key: 'ball', bg: '#FEF3C7' },
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
    (p) =>
      !targetName.toLowerCase().includes(p.name.toLowerCase()) &&
      !p.name.toLowerCase().includes(targetName.toLowerCase())
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

function generateDeterministicGame(
  topic: string,
  ageRange: string,
  questionCount: number,
  gameType: string,
  safeChoicesCount: number,
  answerType: string,
  shuffleChoices: boolean,
  goal?: string
) {
  const rawTopic = (topic || '').trim();
  const lower = rawTopic.toLowerCase();
  const count = Math.max(2, Math.min(questionCount || 4, 6));

  // 1. Quả Chuối / Banana
  if (lower.includes('chuối') || lower.includes('banana')) {
    const items = [
      {
        id: `item_banana_${Date.now()}_0`,
        name: 'Quả Chuối',
        questionText: 'Bé tìm Quả Chuối màu vàng chín thơm ở đâu nào?',
        soundText: 'Vàng tươi cong cong',
        readingSentence: 'Đây là Quả Chuối chín vàng óng ả, dáng cong cong như vầng trăng khuyết.',
        movementSuggestion: 'Hai bàn tay chụm lại uốn cong mô phỏng hình quả chuối',
        praisePhrase: 'Giỏi quá! Bé đã tìm đúng Quả Chuối màu vàng rồi!',
        encouragementPhrase: 'Con nhìn kĩ quả màu vàng cong cong nhé!',
        bgColor: '#FEF9C3',
        suggestedSvgKey: 'banana',
        choices: buildFallbackChoices('Quả Chuối', safeChoicesCount, 'banana', '#FEF9C3'),
      },
      {
        id: `item_banana_${Date.now()}_1`,
        name: 'Quả Chuối',
        questionText: 'Quả gì bóc vỏ roẹt roẹt ngọt mềm cho bé ăn ngon miệng?',
        soundText: 'Bóc vỏ roẹt roẹt',
        readingSentence: 'Bé bóc vỏ quả chuối nhẹ nhàng từ trên xuống, ruột chuối thơm mềm ngọt mát.',
        movementSuggestion: 'Hai tay làm động tác bóc vỏ chuối: Roẹt roẹt rồi đưa lên miệng măm măm',
        praisePhrase: 'Bé thông minh lắm! Quả chuối bóc vỏ thơm ngon của bé đây rồi!',
        encouragementPhrase: 'Con tìm quả có dáng dài cong cong để bóc vỏ nhé!',
        bgColor: '#FEF9C3',
        suggestedSvgKey: 'banana',
        choices: buildFallbackChoices('Quả Chuối', safeChoicesCount, 'banana', '#FEF9C3'),
      },
      {
        id: `item_banana_${Date.now()}_2`,
        name: 'Quả Chuối',
        questionText: 'Bé chạm vào Quả Chuối ngọt ngào nhiều vitamin nào!',
        soundText: 'Ngon ngọt bổ dưỡng',
        readingSentence: 'Quả chuối rất tốt cho sức khỏe, giúp bé cao lớn và thông minh mỗi ngày.',
        movementSuggestion: 'Hai tay xoa nhẹ quanh bụng cười tươi thích thú',
        praisePhrase: 'Hoan hô bé yêu! Quả chuối thơm ngon bổ dưỡng đây rồi!',
        encouragementPhrase: 'Con quan sát và chạm vào quả chuối chín thơm nhé!',
        bgColor: '#FEF9C3',
        suggestedSvgKey: 'banana',
        choices: buildFallbackChoices('Quả Chuối', safeChoicesCount, 'banana', '#FEF9C3'),
      },
      {
        id: `item_banana_${Date.now()}_3`,
        name: 'Quả Chuối',
        questionText: 'Nải chuối chín vàng ươm mẹ mua cho bé ở đâu nhỉ?',
        soundText: 'Nải chuối vàng ươm',
        readingSentence: 'Mẹ đi chợ mua nải chuối chín vàng thơm phức phần cho bé yêu.',
        movementSuggestion: 'Xòe các ngón tay như nải chuối nhiều quả xếp cạnh nhau',
        praisePhrase: 'Đúng rồi! Bé nhận biết quả chuối rất xuất sắc!',
        encouragementPhrase: 'Bé tìm quả chuối màu vàng cong cong nhé!',
        bgColor: '#FEF9C3',
        suggestedSvgKey: 'banana',
        choices: buildFallbackChoices('Quả Chuối', safeChoicesCount, 'banana', '#FEF9C3'),
      },
    ].slice(0, count);

    return {
      id: `game_${Date.now()}`,
      title: 'Bé Khám Phá: Quả Chuối Vàng Thơm',
      topic: 'Quả Chuối',
      category: 'fruits',
      ageRange,
      gameType,
      objectives: goal || 'Dạy trẻ nhận biết quả chuối: màu vàng tươi, dáng cong cong, ruột mềm ngọt bổ dưỡng.',
      choicesCount: safeChoicesCount,
      defaultChoiceCount: safeChoicesCount,
      answerType,
      shuffleChoices,
      items,
    };
  }

  // 2. Quả Táo / Apple
  if (lower.includes('táo') || lower.includes('apple')) {
    const items = [
      {
        id: `item_apple_${Date.now()}_0`,
        name: 'Quả Táo',
        questionText: 'Quả Táo màu đỏ ngọt thơm ở đâu nào bé ơi?',
        soundText: 'Đỏ mọng giòn ngọt',
        readingSentence: 'Quả táo tròn xoe, màu đỏ tươi tắn, cắn vào giòn ngọt mát lành.',
        movementSuggestion: 'Hai tay ôm tròn mô phỏng quả táo chín mọng trên cành',
        praisePhrase: 'Bé giỏi quá! Quả táo đỏ thơm ngon đã được tìm thấy!',
        encouragementPhrase: 'Bé quan sát quả tròn màu đỏ tươi nhé!',
        bgColor: '#FEE2E2',
        suggestedSvgKey: 'apple',
        choices: buildFallbackChoices('Quả Táo', safeChoicesCount, 'apple', '#FEE2E2'),
      },
      {
        id: `item_apple_${Date.now()}_1`,
        name: 'Quả Táo',
        questionText: 'Quả gì tròn xoe, vỏ màu đỏ láng bóng thơm ngon?',
        soundText: 'Tròn xoe láng bóng',
        readingSentence: 'Vỏ quả táo láng bóng mịn màng, nhiều vitamin bổ dưỡng cho bé.',
        movementSuggestion: 'Xoa hai lòng bàn tay tròn đều vào nhau mỉm cười',
        praisePhrase: 'Đúng rồi! Bé thật tinh mắt nhận ra quả táo!',
        encouragementPhrase: 'Con tìm quả tròn màu đỏ nhé!',
        bgColor: '#FEE2E2',
        suggestedSvgKey: 'apple',
        choices: buildFallbackChoices('Quả Táo', safeChoicesCount, 'apple', '#FEE2E2'),
      },
    ].slice(0, count);

    return {
      id: `game_${Date.now()}`,
      title: 'Bé Khám Phá: Quả Táo Đỏ Mọng',
      topic: 'Quả Táo',
      category: 'fruits',
      ageRange,
      gameType,
      objectives: goal || 'Dạy trẻ nhận biết quả táo tròn xoe màu đỏ, vị giòn ngọt.',
      choicesCount: safeChoicesCount,
      defaultChoiceCount: safeChoicesCount,
      answerType,
      shuffleChoices,
      items,
    };
  }

  // 3. Bạn Mèo / Cat
  if (lower.includes('mèo') || lower.includes('cat')) {
    const items = [
      {
        id: `item_cat_${Date.now()}_0`,
        name: 'Bạn Mèo',
        questionText: 'Con gì kêu meo meo? Tìm Bạn Mèo nào!',
        soundText: 'Meo meo đáng yêu',
        readingSentence: 'Bạn Mèo có bộ lông mịn màng, đôi tai vểnh và kêu meo meo.',
        movementSuggestion: 'Hai tay vuốt má nhẹ nhàng làm động tác mèo rửa mặt',
        praisePhrase: 'Tuyệt vời! Bé bắt chước bạn mèo rửa mặt rất khéo!',
        encouragementPhrase: 'Lắng nghe tiếng meo meo và chọn lại nhé con!',
        bgColor: '#FFF7ED',
        suggestedSvgKey: 'cat',
        choices: buildFallbackChoices('Bạn Mèo', safeChoicesCount, 'cat', '#FFF7ED'),
      },
      {
        id: `item_cat_${Date.now()}_1`,
        name: 'Bạn Mèo',
        questionText: 'Bạn Mèo thích sưởi nắng ấm và trèo cau ở đâu nhỉ?',
        soundText: 'Sưởi nắng ấm',
        readingSentence: 'Mèo con thích nằm sưởi nắng ngoài sân và bắt chuột giúp mẹ.',
        movementSuggestion: 'Chắp hai tay sau lưng bước đi nhẹ nhàng rón rén',
        praisePhrase: 'Hoan hô bé! Bạn mèo ngoan của con đây rồi!',
        encouragementPhrase: 'Con tìm bạn mèo có đôi tai tam giác nhé!',
        bgColor: '#FFF7ED',
        suggestedSvgKey: 'cat',
        choices: buildFallbackChoices('Bạn Mèo', safeChoicesCount, 'cat', '#FFF7ED'),
      },
    ].slice(0, count);

    return {
      id: `game_${Date.now()}`,
      title: 'Bé Khám Phá: Bạn Mèo Đáng Yêu',
      topic: 'Bạn Mèo',
      category: 'animals',
      ageRange,
      gameType,
      objectives: goal || 'Dạy trẻ nhận biết bạn mèo, phát âm meo meo và làm động tác rửa mặt.',
      choicesCount: safeChoicesCount,
      defaultChoiceCount: safeChoicesCount,
      answerType,
      shuffleChoices,
      items,
    };
  }

  // 4. Dynamic Single-Item Generator for ANY Topic
  let cleanName = rawTopic
    .replace(/^(bé nhận biết|nhận biết|khám phá|trò chơi|tìm)\s*/i, '')
    .trim();
  if (!cleanName) cleanName = rawTopic || 'Đồ Vật Quanh Bé';
  cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  const dynamicItems = [
    {
      id: `item_dyn_${Date.now()}_0`,
      name: cleanName,
      soundText: 'Đáng yêu xinh xắn',
      questionText: `Bé nhìn xem, ${cleanName} đáng yêu ở đâu nào?`,
      readingSentence: `Đây là ${cleanName} quen thuộc, bé quan sát thật kỹ nhé.`,
      movementSuggestion: 'Vỗ hai bàn tay vào nhau reo vui phấn khởi',
      praisePhrase: `Giỏi quá! Bé đã tìm đúng ${cleanName} rồi!`,
      encouragementPhrase: `Con quan sát kỹ và chạm vào ${cleanName} nhé!`,
      bgColor: '#FEF9C3',
      suggestedSvgKey: 'star',
      choices: buildFallbackChoices(cleanName, safeChoicesCount, 'star', '#FEF9C3'),
    },
    {
      id: `item_dyn_${Date.now()}_1`,
      name: cleanName,
      soundText: 'Bé nhận biết nhanh',
      questionText: `Đâu là ${cleanName} xinh xắn của bé nhỉ?`,
      readingSentence: `${cleanName} rất thân quen và gần gũi với bé mỗi ngày.`,
      movementSuggestion: 'Hai tay làm động tác vẫy chào vui vẻ',
      praisePhrase: `Đúng rồi! Bé nhận biết ${cleanName} rất xuất sắc!`,
      encouragementPhrase: `Bé thử lại nhé, tìm ${cleanName} nào!`,
      bgColor: '#FEF9C3',
      suggestedSvgKey: 'star',
      choices: buildFallbackChoices(cleanName, safeChoicesCount, 'star', '#FEF9C3'),
    },
    {
      id: `item_dyn_${Date.now()}_2`,
      name: cleanName,
      soundText: 'Bé chạm vào đây',
      questionText: `Bé chạm tay vào ${cleanName} nào!`,
      readingSentence: `Bé chạm nhẹ vào ${cleanName} để cùng cô khám phá điều thú vị.`,
      movementSuggestion: 'Đưa một ngón tay chạm nhẹ về phía trước',
      praisePhrase: `Hoan hô bé yêu! Bé tìm ${cleanName} chuẩn lắm!`,
      encouragementPhrase: `Con lắng nghe và chạm vào ${cleanName} nhé!`,
      bgColor: '#FEF9C3',
      suggestedSvgKey: 'star',
      choices: buildFallbackChoices(cleanName, safeChoicesCount, 'star', '#FEF9C3'),
    },
    {
      id: `item_dyn_${Date.now()}_3`,
      name: cleanName,
      soundText: 'Bé thông minh',
      questionText: `Bé chỉ cho cô xem ${cleanName} ở đâu nhé!`,
      readingSentence: `Bé yêu thông minh đã nhớ được ${cleanName} rồi đấy!`,
      movementSuggestion: 'Hai tay ôm ngực mỉm cười tự hào',
      praisePhrase: `Tuyệt vời! ${cleanName} của bé đây rồi!`,
      encouragementPhrase: `Bé tìm ${cleanName} xinh xắn nhé!`,
      bgColor: '#FEF9C3',
      suggestedSvgKey: 'star',
      choices: buildFallbackChoices(cleanName, safeChoicesCount, 'star', '#FEF9C3'),
    },
  ].slice(0, count);

  return {
    id: `game_${Date.now()}`,
    title: `Bé Khám Phá: ${cleanName}`,
    topic: cleanName,
    category: 'objects',
    ageRange,
    gameType,
    objectives: goal || `Giúp trẻ ${ageRange} nhận biết ${cleanName}, phát triển ngôn ngữ và vận động.`,
    choicesCount: safeChoicesCount,
    defaultChoiceCount: safeChoicesCount,
    answerType,
    shuffleChoices,
    items: dynamicItems,
  };
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

    const safeChoicesCount = Math.max(2, Math.min(Number(choicesCount) || 2, 6));

    // Try Gemini API if key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Bạn là chuyên gia sư phạm mầm non hàng đầu Việt Nam cho độ tuổi Nhà trẻ (${ageRange}).
Hãy thiết kế một hoạt động trò chơi giáo dục mầm non hoàn chỉnh:
- Chủ đề: "${topic}"
- Độ tuổi: "${ageRange}"
- Số lượng câu hỏi: ${questionCount}
- Dạng trò chơi: "${gameType}"
- Mục tiêu: "${goal || `Dạy trẻ nhận biết ${topic}, phát triển ngôn ngữ từ đơn và vận động tương tác vui vẻ`}"
- BẮT BUỘC SỐ LƯỢNG ĐÁP ÁN MỖI CÂU HỎI: ĐÚNG ${safeChoicesCount} LỰA CHỌN (mỗi câu hỏi phải có chính xác ${safeChoicesCount} đáp án trong mảng 'choices', gồm 1 đáp án đúng isCorrect: true và ${safeChoicesCount - 1} đáp án sai phân tán quen thuộc isCorrect: false).
- Kiểu đáp án: "${answerType === 'multiple' ? 'Nhiều đáp án đúng' : 'Duy nhất một đáp án đúng'}".

QUY TẮC CỐT LÕI VỀ CHỦ ĐỀ (BẮT BUỘC TUÂN THỦ 100%):
Chủ đề do giáo viên yêu cầu là: "${topic}".
1. NẾU CHỦ ĐỀ LÀ MỘT ĐỐI TƯỢNG CỤ THỂ (ví dụ: "Quả Chuối", "Bé nhận biết quả chuối", "Quả Táo", "Con Mèo", "Xe Ô Tô", "Quả Cà Chua", "Củ Cà Rốt"...):
   - BẮT BUỘC TẤT CẢ ${questionCount} CÂU HỎI TRONG BÀI ĐỀU PHẢI CÓ ĐỐI TƯỢNG ĐÚNG CHÍNH LÀ ĐỐI TƯỢNG ĐÓ!
   - Tên đối tượng đúng (name và choice có isCorrect: true) của TẤT CẢ các câu hỏi BẮT BUỘC LÀ "${topic}" (hoặc tên đối tượng đó).
   - Mỗi câu hỏi sẽ khai thác một nét đặc trưng khác nhau của đối tượng đó để trẻ 12–24 tháng nhận biết toàn diện (hình dáng cong/tròn, màu sắc vàng/đỏ, cách bóc vỏ/tiếng kêu meo meo, mùi vị bổ dưỡng).
   - Các lựa chọn sai (isCorrect: false) là các đối tượng quen thuộc KHÁC để bé phân biệt (ví dụ: Quả Cam, Quả Táo, Quả Dưa Hấu...).
   - TUYỆT ĐỐI KHÔNG ĐƯỢC sinh ra câu hỏi chính về Quả Táo, Con Mèo hay đối tượng khác khi giáo viên yêu cầu là Quả Chuối!

2. NẾU CHỦ ĐỀ LÀ MỘT DANH MỤC TỔNG QUÁT (ví dụ: "Các loại quả", "Thế giới động vật", "Phương tiện giao thông"):
   - Mỗi câu hỏi có thể là một đối tượng khác nhau thuộc đúng danh mục đó.

Trả về JSON duy nhất (không kèm markdown):
{
  "title": "Tên trò chơi",
  "topic": "${topic}",
  "ageRange": "${ageRange}",
  "gameType": "${gameType}",
  "choicesCount": ${safeChoicesCount},
  "defaultChoiceCount": ${safeChoicesCount},
  "answerType": "${answerType}",
  "shuffleChoices": ${shuffleChoices},
  "items": [
    {
      "name": "Tên đối tượng đúng (ví dụ: Quả Chuối)",
      "soundText": "Từ tượng thanh hoặc đặc điểm nổi bật",
      "questionText": "Câu hỏi ngắn gọn đọc cho trẻ",
      "readingSentence": "Câu đọc nhẹ nhàng mở rộng",
      "movementSuggestion": "Gợi ý vận động tương tác vui nhộn",
      "praisePhrase": "Khen ngợi đúng",
      "encouragementPhrase": "Động viên thử lại",
      "bgColor": "#FEF9C3",
      "suggestedSvgKey": "banana",
      "choices": [
        { "name": "Quả Chuối", "isCorrect": true, "suggestedSvgKey": "banana", "bgColor": "#FEF9C3" },
        { "name": "Quả Cam", "isCorrect": false, "suggestedSvgKey": "orange", "bgColor": "#FFEDD5" }
      ]
    }
  ]
}`;

        const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
          Promise.race([
            promise,
            new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI generation timeout')), ms)),
          ]);

        let response;
        try {
          response = await withTimeout(
            ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' },
            }),
            5000
          );
        } catch (err38) {
          console.warn('[Vercel AI Game] Gemini 3.8 flash error, trying gemini-flash-latest:', err38);
          try {
            response = await withTimeout(
              ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
                config: { responseMimeType: 'application/json' },
              }),
              5000
            );
          } catch (errLatest) {
            console.warn('[Vercel AI Game] Gemini flash latest error or timeout:', errLatest);
          }
        }

        if (response?.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({
            game: {
              ...parsed,
              id: `game_${Date.now()}`,
              choicesCount: safeChoicesCount,
              defaultChoiceCount: safeChoicesCount,
              answerType,
              shuffleChoices,
            },
          });
        }
      } catch (geminiErr: any) {
        console.warn('[Vercel AI Game] Gemini error, using deterministic generator:', geminiErr?.message);
      }
    }

    // High quality deterministic preschool generator
    const fallbackGame = generateDeterministicGame(
      topic,
      ageRange,
      questionCount,
      gameType,
      safeChoicesCount,
      answerType,
      shuffleChoices,
      goal
    );

    return res.json({
      game: fallbackGame,
      source: 'preset_generator',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
