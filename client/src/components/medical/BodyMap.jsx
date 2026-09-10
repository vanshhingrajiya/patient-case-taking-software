import React, { useState, useId } from "react";
import { X, Check, RotateCcw, Crosshair, ArrowRight, User, MousePointer } from "lucide-react";

/**
 * Multilingual UI translations for BodyMap component
 */
const UI_TRANSLATIONS = {
  en: {
    modalTitle: "Select Problem Location",
    modalSubtitle: "Tap the body area where you are feeling discomfort or symptoms",
    frontView: "Front",
    backView: "Back",
    selectedPrefix: "Selected Area",
    noSelection: "No area selected yet — tap any part of the body",
    continueBtn: "Continue with this area",
    cancelBtn: "Cancel",
    switchTip: "Switch to Back view if your symptom is on your back",
    perspectiveNotice: "Body view reflects your own body orientation",
  },
  hi: {
    modalTitle: "तकलीफ की जगह चुनें",
    modalSubtitle: "शरीर के उस हिस्से पर टैप करें जहां आपको दर्द या समस्या महसूस हो रही है",
    frontView: "सामने (Front)",
    backView: "पीछे (Back)",
    selectedPrefix: "चुना हुआ हिस्सा",
    noSelection: "अभी तक कोई हिस्सा नहीं चुना — शरीर के किसी भी अंग पर टैप करें",
    continueBtn: "आगे बढ़ें (Continue)",
    cancelBtn: "रद्द करें (Cancel)",
    switchTip: "यदि समस्या पीठ की तरफ है तो 'पीछे' व्यू चुनें",
    perspectiveNotice: "शरीर का दृश्य आपके अनुसार है",
  },
  bn: {
    modalTitle: "সমস্যার স্থান নির্বাচন করুন",
    modalSubtitle: "শরীরের যে অংশে আপনার অস্বস্তি বা সমস্যা হচ্ছে সেখানে আলতো চাপুন",
    frontView: "সামনে (Front)",
    backView: "পেছনে (Back)",
    selectedPrefix: "নির্বাচিত স্থান",
    noSelection: "এখনও কোনও স্থান নির্বাচন করা হয়নি — শরীরের যে কোনও অংশে চাপুন",
    continueBtn: "এগিয়ে যান (Continue)",
    cancelBtn: "বাতিল করুন",
    switchTip: "যদি সমস্যাটি পিঠের দিকে হয় তবে 'পেছনে' ভিউ নির্বাচন করুন",
    perspectiveNotice: "শরীরের দৃশ্যটি আপনার নিজস্ব দিক নির্দেশ করে",
  },
  mr: {
    modalTitle: "त्रासाची जागा निवडा",
    modalSubtitle: "शरीराच्या ज्या भागावर त्रास होत आहे त्यावर टॅप करा",
    frontView: "समोरून (Front)",
    backView: "मागून (Back)",
    selectedPrefix: "निवडलेला भाग",
    noSelection: "अजून कोणताही भाग निवडलेला नाही — शरीराच्या कोणत्याही भागावर टॅप करा",
    continueBtn: "पुढे जा (Continue)",
    cancelBtn: "रद्द करा",
    switchTip: "त्रास पाठीच्या बाजूला असल्यास 'मागून' व्ह्यू निवडा",
    perspectiveNotice: "शरीराचे दृश्य तुमच्या दृष्टिकोनातून आहे",
  },
  ta: {
    modalTitle: "பிரச்சனை உள்ள பகுதியைத் தேர்ந்தெடுக்கவும்",
    modalSubtitle: "உங்களுக்கு வலி அல்லது பிரச்சனை உள்ள உடல் பகுதியில் தட்டவும்",
    frontView: "முன்புறம் (Front)",
    backView: "பின்புறம் (Back)",
    selectedPrefix: "தேர்ந்தெடுக்கப்பட்ட பகுதி",
    noSelection: "இன்னும் பகுதி எதுவும் தேர்ந்தெடுக்கப்படவில்லை — உடலின் ஏதேனும் ஒரு பகுதியில் தட்டவும்",
    continueBtn: "தொடரவும் (Continue)",
    cancelBtn: "ரத்து செய்",
    switchTip: "பிரச்சனை பின்புறம் இருந்தால் 'பின்புறம்' பார்வையைத் தேர்ந்தெடுக்கவும்",
    perspectiveNotice: "உடல் பார்வை உங்கள் சொந்த நோக்குநிலையைக் காட்டுகிறது",
  },
  te: {
    modalTitle: "సమస్య ఉన్న భాగాన్ని ఎంచుకోండి",
    modalSubtitle: "మీకు నొప్పి లేదా సమస్య ఉన్న శరీర భాగంపై తాకండి",
    frontView: "ముందు (Front)",
    backView: "వెనుక (Back)",
    selectedPrefix: "ఎంచుకున్న భాగం",
    noSelection: "ఇంకా ఏ భాగం ఎంపిక కాలేదు — శరీరంలో ఏదైనా భాగంపై తాకండి",
    continueBtn: "కొనసాగించండి (Continue)",
    cancelBtn: "రద్దు చేయండి",
    switchTip: "సమస్య వీపు భాగంలో ఉంటే 'వెనుక' వీక్షణను ఎంచుకోండి",
    perspectiveNotice: "శరీర వీక్షణ మీ స్వంత శరీర దిశను ప్రతిబింబిస్తుంది",
  },
  gu: {
    modalTitle: "તકલીફવાળો ભાગ પસંદ કરો",
    modalSubtitle: "શરીરના જે ભાગમાં તમને દુખાવો કે તકલીફ હોય ત્યાં ટેપ કરો",
    frontView: "આગળ (Front)",
    backView: "પાછળ (Back)",
    selectedPrefix: "પસંદ કરેલ ભાગ",
    noSelection: "હજુ સુધી કોઈ ભાગ પસંદ કરેલ નથી — શરીરના કોઈપણ ભાગ પર ટેપ કરો",
    continueBtn: "આગળ વધો (Continue)",
    cancelBtn: "રદ કરો",
    switchTip: "જો તકલીફ પીઠની બાજુ હોય તો 'પાછળ' જુઓ",
    perspectiveNotice: "શરીરનું દ્રશ્ય તમારી દિશા દર્શાવે છે",
  },
  kn: {
    modalTitle: "ಸಮಸ್ಯೆಯಿರುವ ಜಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    modalSubtitle: "ನಿಮಗೆ ನೋವು ಅಥವಾ ತೊಂದರೆ ಇರುವ ದೇಹದ ಭಾಗವನ್ನು ಸ್ಪರ್ಶಿಸಿ",
    frontView: "ಮುಂಭಾಗ (Front)",
    backView: "ಹಿಂಭಾಗ (Back)",
    selectedPrefix: "ಆಯ್ಕೆಮಾಡಿದ ಭಾಗ",
    noSelection: "ಇನ್ನೂ ಯಾವುದೇ ಭಾಗವನ್ನು ಆಯ್ಕೆ ಮಾಡಿಲ್ಲ — ದೇಹದ ಯಾವುದೇ ಭಾಗವನ್ನು ಸ್ಪರ್ಶಿಸಿ",
    continueBtn: "ಮುಂದುವರಿಯಿರಿ (Continue)",
    cancelBtn: "ರದ್ದುಮಾಡಿ",
    switchTip: "ತೊಂದರೆ ಬೆನ್ನಿನಲ್ಲಿದ್ದರೆ 'ಹಿಂಭಾಗ' ನೋಟವನ್ನು ಆರಿಸಿ",
    perspectiveNotice: "ದೇಹದ ನೋಟವು ನಿಮ್ಮ ದೃಷ್ಟಿಕೋನವನ್ನು ತೋರಿಸುತ್ತದೆ",
  },
  ml: {
    modalTitle: "പ്രശ്നമുള്ള സ്ഥലം തിരഞ്ഞെടുക്കുക",
    modalSubtitle: "നിങ്ങൾക്ക് അസ്വസ്ഥതയോ വേദനയോ ഉള്ള ശരീരഭാഗത്ത് തൊടുക",
    frontView: "മുൻഭാഗം (Front)",
    backView: "പിൻഭാഗം (Back)",
    selectedPrefix: "തിരഞ്ഞെടുത്ത ഭാഗം",
    noSelection: "ഇതുവരെ ഒരു ഭാഗവും തിരഞ്ഞെടുത്തിട്ടില്ല — ശരീരത്തിലെ ഏതെങ്കിലും ഭാഗത്ത് തൊടുക",
    continueBtn: "തുടരുക (Continue)",
    cancelBtn: "റദ്ദാക്കുക",
    switchTip: "പ്രശ്നം പുറംഭാഗത്താണെങ്കിൽ 'പിൻഭാഗം' തിരഞ്ഞെടുക്കുക",
    perspectiveNotice: "ശരീര വീക്ഷണം നിങ്ങളുടെ സ്വന്തം ദിശയെ പ്രതിഫലിപ്പിക്കുന്നു",
  },
  pa: {
    modalTitle: "ਤਕਲੀਫ਼ ਵਾਲੀ ਥਾਂ ਚੁਣੋ",
    modalSubtitle: "ਸਰੀਰ ਦੇ ਉਸ ਹਿੱਸੇ ਨੂੰ ਛੋਹਵੋ ਜਿੱਥੇ ਤੁਹਾਨੂੰ ਦਰਦ ਜਾਂ ਸਮੱਸਿਆ ਹੈ",
    frontView: "ਸਾਹਮਣੇ (Front)",
    backView: "ਪਿੱਛੇ (Back)",
    selectedPrefix: "ਚੁਣਿਆ ਗਿਆ ਹਿੱਸਾ",
    noSelection: "ਅਜੇ ਤੱਕ ਕੋਈ ਹਿੱਸਾ ਨਹੀਂ ਚੁਣਿਆ — ਸਰੀਰ ਦੇ ਕਿਸੇ ਵੀ ਹਿੱਸੇ 'ਤੇ ਟੈਪ ਕਰੋ",
    continueBtn: "ਅੱਗੇ ਵਧੋ (Continue)",
    cancelBtn: "ਰੱਦ ਕਰੋ",
    switchTip: "ਜੇਕਰ ਸਮੱਸਿਆ ਪਿੱਠ ਵਾਲੇ ਪਾਸੇ ਹੈ ਤਾਂ 'ਪਿੱਛੇ' ਦ੍ਰਿਸ਼ ਚੁਣੋ",
    perspectiveNotice: "ਸਰੀਰ ਦਾ ਦ੍ਰਿਸ਼ ਤੁਹਾਡੀ ਦਿਸ਼ਾ ਦਰਸਾਉਂਦਾ ਹੈ",
  },
  od: {
    modalTitle: "ସମସ୍ୟା ଥିବା ସ୍ଥାନ ବାଛନ୍ତୁ",
    modalSubtitle: "ଶରୀରର ଯେଉଁ ଅଂଶରେ କଷ୍ଟ ବା ଯନ୍ତ୍ରଣା ହେଉଛି ତାହା ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ",
    frontView: "ଆଗ (Front)",
    backView: "ପଛ (Back)",
    selectedPrefix: "ଚୟନିତ ସ୍ଥାନ",
    noSelection: "କୌଣସି ସ୍ଥାନ ଚୟନ କରାଯାଇ ନାହିଁ — ଶରୀରର କୌଣସି ଅଂଶ ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ",
    continueBtn: "ଆଗକୁ ବଢ଼ନ୍ତୁ (Continue)",
    cancelBtn: "ବାତିଲ୍ କରନ୍ତୁ",
    switchTip: "ଯଦି ପିଠିରେ ସମସ୍ୟା ଅଛି ତେବେ 'ପଛ' ଦୃଶ୍ୟ ବାଛନ୍ତୁ",
    perspectiveNotice: "ଶରୀର ଦୃଶ୍ୟ ଆପଣଙ୍କ ନିଜ ଦିଗକୁ ଦର୍ଶାଏ",
  },
};

/**
 * Data definitions for all selectable anatomical body regions with translations
 */
export const BODY_PARTS = {
  front: [
    {
      id: "head",
      value: "Problem in Head",
      center: { x: 160, y: 50 },
      labels: {
        en: "Head",
        hi: "सिर (Head)",
        bn: "মাথা (Head)",
        mr: "डोके (Head)",
        ta: "தலை (Head)",
        te: "తల (Head)",
        gu: "માથું (Head)",
        kn: "ತಲೆ (Head)",
        ml: "തല (Head)",
        pa: "ਸਿਰ (Head)",
        od: "ମୁଣ୍ଡ (Head)",
      },
    },
    {
      id: "face",
      value: "Problem in Face / Eyes / Mouth",
      center: { x: 160, y: 106 },
      labels: {
        en: "Face",
        hi: "चेहरा (Face)",
        bn: "মুখমণ্ডল (Face)",
        mr: "चेहरा (Face)",
        ta: "முகம் (Face)",
        te: "ముఖం (Face)",
        gu: "ચહેરો (Face)",
        kn: "ಮುಖ (Face)",
        ml: "മുഖം (Face)",
        pa: "ਚਿਹਰਾ (Face)",
        od: "ମୁହଁ (Face)",
      },
    },
    {
      id: "neck",
      value: "Problem in Neck / Throat",
      center: { x: 160, y: 140 },
      labels: {
        en: "Neck",
        hi: "गर्दन / गला (Neck)",
        bn: "ঘাড় / গলা (Neck)",
        mr: "मान / गळा (Neck)",
        ta: "கழுத்து (Neck)",
        te: "మెడ / గొంతు (Neck)",
        gu: "ગળું / ડોક (Neck)",
        kn: "ಕುತ್ತಿಗೆ (Neck)",
        ml: "കഴുത്ത് (Neck)",
        pa: "ਗਰਦਨ (Neck)",
        od: "ବେକ / ଗଳା (Neck)",
      },
    },
    {
      id: "right_shoulder",
      value: "Problem in Right Shoulder",
      center: { x: 100, y: 175 },
      labels: {
        en: "Right Shoulder",
        hi: "दायां कंधा (Right Shoulder)",
        bn: "ডান কাঁধ (Right Shoulder)",
        mr: "उजवा खांदा (Right Shoulder)",
        ta: "வலது தோள்பட்டை (Right Shoulder)",
        te: "కుడి భుజం (Right Shoulder)",
        gu: "જમણો ખભો (Right Shoulder)",
        kn: "ಬಲ ಭುಜ (Right Shoulder)",
        ml: "വലത് തോൾ (Right Shoulder)",
        pa: "ਸੱਜਾ ਮੋਢਾ (Right Shoulder)",
        od: "ଡାହାଣ କାନ୍ଧ (Right Shoulder)",
      },
    },
    {
      id: "left_shoulder",
      value: "Problem in Left Shoulder",
      center: { x: 220, y: 175 },
      labels: {
        en: "Left Shoulder",
        hi: "बायां कंधा (Left Shoulder)",
        bn: "বাম কাঁধ (Left Shoulder)",
        mr: "डावा खांदा (Left Shoulder)",
        ta: "இடது தோள்பட்டை (Left Shoulder)",
        te: "எடమ భుజం (Left Shoulder)",
        gu: "ડાબો ખભો (Left Shoulder)",
        kn: "ಎಡ ಭುಜ (Left Shoulder)",
        ml: "ഇടത് തോൾ (Left Shoulder)",
        pa: "ਖੱਬਾ ਮੋਢਾ (Left Shoulder)",
        od: "ବାମ କାନ୍ଧ (Left Shoulder)",
      },
    },
    {
      id: "chest",
      value: "Chest Pain / Problem in Chest",
      center: { x: 160, y: 210 },
      labels: {
        en: "Chest",
        hi: "छाती (Chest)",
        bn: "বুক (Chest)",
        mr: "छाती (Chest)",
        ta: "நெஞ்சு (Chest)",
        te: "ఛాతీ (Chest)",
        gu: "છાતી (Chest)",
        kn: "ಎದೆ (Chest)",
        ml: "നെഞ്ച് (Chest)",
        pa: "ਛਾਤੀ (Chest)",
        od: "ଛାତି (Chest)",
      },
    },
    {
      id: "upper_abdomen",
      value: "Upper Abdominal Pain / Problem",
      center: { x: 160, y: 260 },
      labels: {
        en: "Upper Abdomen",
        hi: "पेट का ऊपरी हिस्सा (Upper Abdomen)",
        bn: "পেটের ওপরের অংশ (Upper Abdomen)",
        mr: "पोटाचा वरचा भाग (Upper Abdomen)",
        ta: "மேல் வயிறு (Upper Abdomen)",
        te: "పై పొట్ట (Upper Abdomen)",
        gu: "પેટનો ઉપરનો ભાગ (Upper Abdomen)",
        kn: "ಹೊಟ್ಟೆಯ ಮೇಲ್ಭಾಗ (Upper Abdomen)",
        ml: "വയറിന്റെ മുകൾഭാഗം (Upper Abdomen)",
        pa: "ਢਿੱਡ ਦਾ ਉਪਰਲਾ ਹਿੱਸਾ (Upper Abdomen)",
        od: "ଉପର ପେଟ (Upper Abdomen)",
      },
    },
    {
      id: "lower_abdomen",
      value: "Lower Abdominal / Pelvic Problem",
      center: { x: 160, y: 320 },
      labels: {
        en: "Lower Abdomen",
        hi: "पेट का निचला हिस्सा (Lower Abdomen)",
        bn: "পেটের নিচের অংশ (Lower Abdomen)",
        mr: "पोटाचा खालचा भाग (Lower Abdomen)",
        ta: "கீழ் வயிறு (Lower Abdomen)",
        te: "క్రింది పొట్ట (Lower Abdomen)",
        gu: "પેટનો નીચલો ભાગ (Lower Abdomen)",
        kn: "ಹೊಟ್ಟೆಯ ಕೆಳಭಾಗ (Lower Abdomen)",
        ml: "വയറിന്റെ അടിഭാഗം (Lower Abdomen)",
        pa: "ਢਿੱਡ ਦਾ ਹੇਠਲਾ ਹਿੱਸਾ (Lower Abdomen)",
        od: "ତଳ ପେଟ (Lower Abdomen)",
      },
    },
    {
      id: "right_arm",
      value: "Problem in Right Arm",
      center: { x: 80, y: 270 },
      labels: {
        en: "Right Arm",
        hi: "दायां हाथ/बांह (Right Arm)",
        bn: "ডান হাত (Right Arm)",
        mr: "उजवा हात (Right Arm)",
        ta: "வலது கை (Right Arm)",
        te: "కుడి చేయి (Right Arm)",
        gu: "જમણો હાથ (Right Arm)",
        kn: "ಬಲ ತೋಳು (Right Arm)",
        ml: "വലത് കൈ (Right Arm)",
        pa: "ਸੱਜੀ ਬਾਂਹ (Right Arm)",
        od: "ଡାହାଣ ହାତ (Right Arm)",
      },
    },
    {
      id: "left_arm",
      value: "Problem in Left Arm",
      center: { x: 240, y: 270 },
      labels: {
        en: "Left Arm",
        hi: "बायां हाथ/बांह (Left Arm)",
        bn: "বাম হাত (Left Arm)",
        mr: "डावा हात (Left Arm)",
        ta: "இடது கை (Left Arm)",
        te: "ఎడమ చేయి (Left Arm)",
        gu: "ડાબો હાથ (Left Arm)",
        kn: "ಎಡ ತೋಳು (Left Arm)",
        ml: "ഇടത് കൈ (Left Arm)",
        pa: "ਖੱਬੀ ਬਾਂਹ (Left Arm)",
        od: "ବାମ ହାତ (Left Arm)",
      },
    },
    {
      id: "right_hand",
      value: "Problem in Right Hand / Fingers",
      center: { x: 58, y: 370 },
      labels: {
        en: "Right Hand",
        hi: "दायां पंजा / हथेली (Right Hand)",
        bn: "ডান হাতের তালু (Right Hand)",
        mr: "उजवा तळहात (Right Hand)",
        ta: "வலது உள்ளங்கை (Right Hand)",
        te: "కుడి అరచేయి (Right Hand)",
        gu: "જમણી હથેળી (Right Hand)",
        kn: "ಬಲ ಅಂಗೈ (Right Hand)",
        ml: "വലത് കൈപ്പത്തി (Right Hand)",
        pa: "ਸੱਜਾ ਹੱਥ (Right Hand)",
        od: "ଡାହାଣ ପାପୁଲି (Right Hand)",
      },
    },
    {
      id: "left_hand",
      value: "Problem in Left Hand / Fingers",
      center: { x: 262, y: 370 },
      labels: {
        en: "Left Hand",
        hi: "बायां पंजा / हथेली (Left Hand)",
        bn: "বাম হাতের তালু (Left Hand)",
        mr: "डावा तळहात (Left Hand)",
        ta: "இடது உள்ளங்கை (Left Hand)",
        te: "ఎడమ అరచేయి (Left Hand)",
        gu: "ડાબી હથેળી (Left Hand)",
        kn: "ಎಡ ಅಂಗೈ (Left Hand)",
        ml: "ഇടത് കൈപ്പത്തി (Left Hand)",
        pa: "ਖੱਬਾ ਹੱਥ (Left Hand)",
        od: "ବାମ ପାପୁଲି (Left Hand)",
      },
    },
    {
      id: "right_thigh",
      value: "Problem in Right Thigh",
      center: { x: 134, y: 400 },
      labels: {
        en: "Right Thigh",
        hi: "दाईं जांघ (Right Thigh)",
        bn: "ডান উরু (Right Thigh)",
        mr: "उजवी मांडी (Right Thigh)",
        ta: "வலது தொடை (Right Thigh)",
        te: "కుడి తొడ (Right Thigh)",
        gu: "જમણી જાંઘ (Right Thigh)",
        kn: "ಬಲ ತೊಡೆ (Right Thigh)",
        ml: "വലത് തുട (Right Thigh)",
        pa: "ਸੱਜੀ ਪੱਟ (Right Thigh)",
        od: "ଡାହାଣ ଜଙ୍ଘ (Right Thigh)",
      },
    },
    {
      id: "left_thigh",
      value: "Problem in Left Thigh",
      center: { x: 186, y: 400 },
      labels: {
        en: "Left Thigh",
        hi: "बाईं जांघ (Left Thigh)",
        bn: "বাম উরু (Left Thigh)",
        mr: "डावी मांडी (Left Thigh)",
        ta: "இடது தொடை (Left Thigh)",
        te: "ఎడమ తొడ (Left Thigh)",
        gu: "ડાબી જાંઘ (Left Thigh)",
        kn: "ಎಡ ತೊಡೆ (Left Thigh)",
        ml: "ഇടത് തുട (Left Thigh)",
        pa: "ਖੱਬੀ ਪੱਟ (Left Thigh)",
        od: "ବାମ ଜଙ୍ଘ (Left Thigh)",
      },
    },
    {
      id: "right_knee",
      value: "Problem in Right Knee",
      center: { x: 134, y: 486 },
      labels: {
        en: "Right Knee",
        hi: "दायां घुटना (Right Knee)",
        bn: "ডান হাঁটু (Right Knee)",
        mr: "उजवा गुडघा (Right Knee)",
        ta: "வலது முழங்கால் (Right Knee)",
        te: "కుడి మోకాలు (Right Knee)",
        gu: "જમણો ઢીંચણ (Right Knee)",
        kn: "ಬಲ ಮೊಣಕಾಲು (Right Knee)",
        ml: "വലത് മുട്ട് (Right Knee)",
        pa: "ਸੱਜਾ ਗੋਡਾ (Right Knee)",
        od: "ଡାହାଣ ଆଣ୍ଠୁ (Right Knee)",
      },
    },
    {
      id: "left_knee",
      value: "Problem in Left Knee",
      center: { x: 186, y: 486 },
      labels: {
        en: "Left Knee",
        hi: "बायां घुटना (Left Knee)",
        bn: "বাম হাঁটু (Left Knee)",
        mr: "डावा गुडघा (Left Knee)",
        ta: "இடது முழங்கால் (Left Knee)",
        te: "ఎడమ మోకాలు (Left Knee)",
        gu: "ડાબો ઢીંચણ (Left Knee)",
        kn: "ಎಡ ಮೊಣಕಾಲು (Left Knee)",
        ml: "ഇടത് മുട്ട് (Left Knee)",
        pa: "ਖੱਬਾ ਗੋਡਾ (Left Knee)",
        od: "ବାମ ଆଣ୍ଠୁ (Left Knee)",
      },
    },
    {
      id: "right_lower_leg",
      value: "Problem in Right Lower Leg / Shin",
      center: { x: 134, y: 548 },
      labels: {
        en: "Right Lower Leg",
        hi: "दायां निचला पैर / पिंडली (Right Leg)",
        bn: "ডান পায়ের নিচের অংশ (Right Leg)",
        mr: "उजवी पोटरी / पाय (Right Leg)",
        ta: "வலது கீழ் கால் (Right Leg)",
        te: "కుడి పిక్క / కాలు (Right Leg)",
        gu: "જમણી પિંડી / પગ (Right Leg)",
        kn: "ಬಲ ಕಾಲು (Right Leg)",
        ml: "വലത് കണങ്കാൽ (Right Leg)",
        pa: "ਸੱਜੀ ਲੱਤ (Right Leg)",
        od: "ଡାହାଣ ଗୋଡ଼ (Right Leg)",
      },
    },
    {
      id: "left_lower_leg",
      value: "Problem in Left Lower Leg / Shin",
      center: { x: 186, y: 548 },
      labels: {
        en: "Left Lower Leg",
        hi: "बायां निचला पैर / पिंडली (Left Leg)",
        bn: "বাম পায়ের নিচের অংশ (Left Leg)",
        mr: "डावी पोटरी / पाय (Left Leg)",
        ta: "இடது கீழ் கால் (Left Leg)",
        te: "ఎడమ పిక్క / కాలు (Left Leg)",
        gu: "ડાબી પિંડી / પગ (Left Leg)",
        kn: "ಎಡ ಕಾಲು (Left Leg)",
        ml: "ഇടത് കണങ്കാൽ (Left Leg)",
        pa: "ਖੱਬੀ ਲੱਤ (Left Leg)",
        od: "ବାମ ଗୋଡ଼ (Left Leg)",
      },
    },
    {
      id: "right_foot",
      value: "Problem in Right Foot / Ankle",
      center: { x: 128, y: 612 },
      labels: {
        en: "Right Foot",
        hi: "दायां पैर / पंजा (Right Foot)",
        bn: "ডান পায়ের পাতা (Right Foot)",
        mr: "उजवा पाय / पाऊल (Right Foot)",
        ta: "வலது பாதம் (Right Foot)",
        te: "కుడి పాదం (Right Foot)",
        gu: "જમણો પંજો / પગ (Right Foot)",
        kn: "ಬಲ ಪಾದ (Right Foot)",
        ml: "വലത് പാദം (Right Foot)",
        pa: "ਸੱਜਾ ਪੈਰ (Right Foot)",
        od: "ଡାହାଣ ପାଦ (Right Foot)",
      },
    },
    {
      id: "left_foot",
      value: "Problem in Left Foot / Ankle",
      center: { x: 192, y: 612 },
      labels: {
        en: "Left Foot",
        hi: "बायां पैर / पंजा (Left Foot)",
        bn: "বাম পায়ের পাতা (Left Foot)",
        mr: "डावा पाय / पाऊल (Left Foot)",
        ta: "இடது பாதம் (Left Foot)",
        te: "ఎడమ పాదం (Left Foot)",
        gu: "ડાબો પંજો / પગ (Left Foot)",
        kn: "ಎಡ ಪಾದ (Left Foot)",
        ml: "ഇടത് പാദം (Left Foot)",
        pa: "ਖੱਬਾ ਪੈਰ (Left Foot)",
        od: "ବାମ ପାଦ (Left Foot)",
      },
    },
  ],

  back: [
    {
      id: "head_back",
      value: "Problem in Back of Head / Occiput",
      center: { x: 160, y: 70 },
      labels: {
        en: "Head (Back)",
        hi: "सिर का पिछला हिस्सा (Head Back)",
        bn: "মাথার পেছনের অংশ (Head Back)",
        mr: "डोक्याचा मागचा भाग (Head Back)",
        ta: "தலையின் பின்புறம் (Head Back)",
        te: "తల వెనుక భాగం (Head Back)",
        gu: "માથાનો પાછળનો ભાગ (Head Back)",
        kn: "ತಲೆಯ ಹಿಂಭಾಗ (Head Back)",
        ml: "തലയുടെ പിൻഭാഗം (Head Back)",
        pa: "ਸਿਰ ਦਾ ਪਿਛਲਾ ਹਿੱਸਾ (Head Back)",
        od: "ମୁଣ୍ଡ ପଛପଟ (Head Back)",
      },
    },
    {
      id: "neck_back",
      value: "Problem in Back of Neck / Cervical Spine",
      center: { x: 160, y: 134 },
      labels: {
        en: "Neck (Back)",
        hi: "गर्दन का पिछला भाग (Neck Back)",
        bn: "ঘাড়ের পেছনের অংশ (Neck Back)",
        mr: "मानेचा मागचा भाग (Neck Back)",
        ta: "கழுத்து பின்புறம் (Neck Back)",
        te: "మెడ వెనుక భాగం (Neck Back)",
        gu: "ડોકનો પાછળનો ભાગ (Neck Back)",
        kn: "ಕುತ್ತಿಗೆಯ ಹಿಂಭಾಗ (Neck Back)",
        ml: "കഴുത്തിന്റെ പിൻഭാഗം (Neck Back)",
        pa: "ਗਰਦਨ ਦਾ ਪਿਛਲਾ ਹਿੱਸਾ (Neck Back)",
        od: "ବେକ ପଛପଟ (Neck Back)",
      },
    },
    {
      id: "left_shoulder_back",
      value: "Problem in Left Shoulder (Back)",
      center: { x: 100, y: 174 },
      labels: {
        en: "Left Shoulder",
        hi: "बायां कंधा (Left Shoulder)",
        bn: "বাম কাঁধ (Left Shoulder)",
        mr: "डावा खांदा (Left Shoulder)",
        ta: "இடது தோள்பட்டை (Left Shoulder)",
        te: "ఎడమ భుజం (Left Shoulder)",
        gu: "ડાબો ખભો (Left Shoulder)",
        kn: "ಎಡ ಭುಜ (Left Shoulder)",
        ml: "ഇടത് തോൾ (Left Shoulder)",
        pa: "ਖੱਬਾ ਮੋਢਾ (Left Shoulder)",
        od: "ବାମ କାନ୍ଧ (Left Shoulder)",
      },
    },
    {
      id: "right_shoulder_back",
      value: "Problem in Right Shoulder (Back)",
      center: { x: 220, y: 174 },
      labels: {
        en: "Right Shoulder",
        hi: "दायां कंधा (Right Shoulder)",
        bn: "ডান কাঁধ (Right Shoulder)",
        mr: "उजवा खांदा (Right Shoulder)",
        ta: "வலது தோள்பட்டை (Right Shoulder)",
        te: "కుడి భుజం (Right Shoulder)",
        gu: "જમણો ખભો (Right Shoulder)",
        kn: "ಬಲ ಭುಜ (Right Shoulder)",
        ml: "വലത് തോൾ (Right Shoulder)",
        pa: "ਸੱਜਾ ਮੋਢਾ (Right Shoulder)",
        od: "ଡାହାଣ କାନ୍ଧ (Right Shoulder)",
      },
    },
    {
      id: "upper_back",
      value: "Upper Back Pain / Shoulder Blade Area",
      center: { x: 160, y: 208 },
      labels: {
        en: "Upper Back",
        hi: "ऊपरी पीठ (Upper Back)",
        bn: "পিঠের ওপরের অংশ (Upper Back)",
        mr: "पाठीचा वरचा भाग (Upper Back)",
        ta: "மேல் முதுகு (Upper Back)",
        te: "పై వీపు (Upper Back)",
        gu: "પીઠનો ઉપરનો ભાગ (Upper Back)",
        kn: "ಬೆನ್ನಿನ ಮೇಲ್ಭಾಗ (Upper Back)",
        ml: "മുകൾ ഭാഗം പുറം (Upper Back)",
        pa: "ਉਪਰਲੀ ਪਿੱਠ (Upper Back)",
        od: "ଉପର ପିଠି (Upper Back)",
      },
    },
    {
      id: "middle_back",
      value: "Middle Back Pain",
      center: { x: 160, y: 258 },
      labels: {
        en: "Middle Back",
        hi: "मध्य पीठ (Middle Back)",
        bn: "পিঠের মাঝের অংশ (Middle Back)",
        mr: "पाठीचा मधला भाग (Middle Back)",
        ta: "நடு முதுகு (Middle Back)",
        te: "మధ్య వీపు (Middle Back)",
        gu: "પીઠનો મધ્ય ભાગ (Middle Back)",
        kn: "ಬೆನ್ನಿನ ಮಧ್ಯಭಾಗ (Middle Back)",
        ml: "നടുഭാഗം പുറം (Middle Back)",
        pa: "ਵਿਚਕਾਰਲੀ ਪਿੱਠ (Middle Back)",
        od: "ମଝି ପିଠି (Middle Back)",
      },
    },
    {
      id: "lower_back",
      value: "Lower Back Pain / Lumbar Problem",
      center: { x: 160, y: 318 },
      labels: {
        en: "Lower Back",
        hi: "निचली पीठ / कमर (Lower Back)",
        bn: "কোমর / পিঠের নিচের অংশ (Lower Back)",
        mr: "कंबर / पाठीचा खालचा भाग (Lower Back)",
        ta: "கீழ் முதுகு / இடுப்பு (Lower Back)",
        te: "క్రింది వీపు / నడుము (Lower Back)",
        gu: "કમર / પીઠનો નીચલો ભાગ (Lower Back)",
        kn: "ಸೊಂಟ / ಬೆನ್ನಿನ ಕೆಳಭಾಗ (Lower Back)",
        ml: "അടിഭാഗം പുറം / അരക്കെട്ട് (Lower Back)",
        pa: "ਹੇਠਲੀ ਪਿੱਠ / ਲੱਕ (Lower Back)",
        od: "କମର / ତଳ ପିଠି (Lower Back)",
      },
    },
    {
      id: "left_arm_back",
      value: "Problem in Left Arm (Back)",
      center: { x: 80, y: 268 },
      labels: {
        en: "Left Arm",
        hi: "बायां हाथ (Left Arm)",
        bn: "বাম হাত (Left Arm)",
        mr: "डावा हात (Left Arm)",
        ta: "இடது கை (Left Arm)",
        te: "ఎడమ చేయి (Left Arm)",
        gu: "ડાબો હાથ (Left Arm)",
        kn: "ಎಡ ತೋಳು (Left Arm)",
        ml: "ഇടത് കൈ (Left Arm)",
        pa: "ਖੱਬੀ ਬਾਂਹ (Left Arm)",
        od: "ବାମ ହାତ (Left Arm)",
      },
    },
    {
      id: "right_arm_back",
      value: "Problem in Right Arm (Back)",
      center: { x: 240, y: 268 },
      labels: {
        en: "Right Arm",
        hi: "दायां हाथ (Right Arm)",
        bn: "ডান হাত (Right Arm)",
        mr: "उजवा हात (Right Arm)",
        ta: "வலது கை (Right Arm)",
        te: "కుడి చేయి (Right Arm)",
        gu: "જમણો હાથ (Right Arm)",
        kn: "ಬಲ ತೋಳು (Right Arm)",
        ml: "വലത് കൈ (Right Arm)",
        pa: "ਸੱਜੀ ਬਾਂਹ (Right Arm)",
        od: "ଡାହାଣ ହାତ (Right Arm)",
      },
    },
    {
      id: "left_hand_back",
      value: "Problem in Left Hand (Back)",
      center: { x: 58, y: 368 },
      labels: {
        en: "Left Hand",
        hi: "बायां हाथ (Left Hand)",
        bn: "বাম হাত (Left Hand)",
        mr: "डावा हात (Left Hand)",
        ta: "இடது கை (Left Hand)",
        te: "ఎడమ చేయి (Left Hand)",
        gu: "ડાબો હાથ (Left Hand)",
        kn: "ಎಡ ಅಂಗೈ (Left Hand)",
        ml: "ഇടത് കൈ (Left Hand)",
        pa: "ਖੱਬਾ ਹੱਥ (Left Hand)",
        od: "ବାମ ହାତ (Left Hand)",
      },
    },
    {
      id: "right_hand_back",
      value: "Problem in Right Hand (Back)",
      center: { x: 262, y: 368 },
      labels: {
        en: "Right Hand",
        hi: "दायां हाथ (Right Hand)",
        bn: "ডান হাত (Right Hand)",
        mr: "उजवा हात (Right Hand)",
        ta: "வலது கை (Right Hand)",
        te: "కుడి చేయి (Right Hand)",
        gu: "જમણો હાથ (Right Hand)",
        kn: "ಬಲ ಅಂಗೈ (Right Hand)",
        ml: "വലത് കൈ (Right Hand)",
        pa: "ਸੱਜਾ ਹੱਥ (Right Hand)",
        od: "ଡାହାଣ ହାତ (Right Hand)",
      },
    },
    {
      id: "left_thigh_back",
      value: "Problem in Left Thigh (Hamstring/Back)",
      center: { x: 134, y: 398 },
      labels: {
        en: "Left Thigh",
        hi: "बाईं जांघ (Left Thigh)",
        bn: "বাম উরু (Left Thigh)",
        mr: "डावी मांडी (Left Thigh)",
        ta: "இடது தொடை (Left Thigh)",
        te: "ఎడమ తొడ (Left Thigh)",
        gu: "ડાબી જાંઘ (Left Thigh)",
        kn: "ಎಡ ತೊಡೆ (Left Thigh)",
        ml: "ഇടത് തുട (Left Thigh)",
        pa: "ਖੱਬੀ ਪੱਟ (Left Thigh)",
        od: "ବାମ ଜଙ୍ଘ (Left Thigh)",
      },
    },
    {
      id: "right_thigh_back",
      value: "Problem in Right Thigh (Hamstring/Back)",
      center: { x: 186, y: 398 },
      labels: {
        en: "Right Thigh",
        hi: "दाईं जांघ (Right Thigh)",
        bn: "ডান উরু (Right Thigh)",
        mr: "उजवी मांडी (Right Thigh)",
        ta: "வலது தொடை (Right Thigh)",
        te: "కుడి తొడ (Right Thigh)",
        gu: "જમણી જાંઘ (Right Thigh)",
        kn: "ಬಲ ತೊಡೆ (Right Thigh)",
        ml: "വലത് തുട (Right Thigh)",
        pa: "ਸੱਜੀ ਪੱਟ (Right Thigh)",
        od: "ଡାହାଣ ଜଙ୍ଘ (Right Thigh)",
      },
    },
    {
      id: "left_knee_back",
      value: "Problem Behind Left Knee",
      center: { x: 134, y: 484 },
      labels: {
        en: "Left Knee (Back)",
        hi: "बायां घुटना (पिछला भाग)",
        bn: "বাম হাঁটুর পেছন (Left Knee)",
        mr: "डावा गुडघा (मागचा भाग)",
        ta: "இடது முழங்கால் பின்புறம்",
        te: "ఎడమ మోకాలు వెనుక",
        gu: "ડાબો ઢીંચણ (પાછળનો ભાગ)",
        kn: "ಎಡ ಮೊಣಕಾಲು ಹಿಂಭಾಗ",
        ml: "ഇടത് മുട്ടിന്റെ പിൻഭാഗം",
        pa: "ਖੱਬੇ ਗੋਡੇ ਦਾ ਪਿੱਛਾ",
        od: "ବାମ ଆଣ୍ଠୁ ପଛପଟ",
      },
    },
    {
      id: "right_knee_back",
      value: "Problem Behind Right Knee",
      center: { x: 186, y: 484 },
      labels: {
        en: "Right Knee (Back)",
        hi: "दायां घुटना (पिछला भाग)",
        bn: "ডান হাঁটুর পেছন (Right Knee)",
        mr: "उजवा गुडघा (मागचा भाग)",
        ta: "வலது முழங்கால் பின்புறம்",
        te: "కుడి మోకాలు వెనుక",
        gu: "જમણો ઢીંચણ (પાછળનો ભાગ)",
        kn: "ಬಲ ಮೊಣಕಾಲು ಹಿಂಭಾಗ",
        ml: "വലത് മുട്ടിന്റെ പിൻഭാഗം",
        pa: "ਸੱਜੇ ਗੋਡੇ ਦਾ ਪਿੱਛਾ",
        od: "ଡାହାଣ ଆଣ୍ଠୁ ପଛପଟ",
      },
    },
    {
      id: "left_lower_leg_back",
      value: "Problem in Left Calf / Back of Leg",
      center: { x: 134, y: 546 },
      labels: {
        en: "Left Calf",
        hi: "बाईं पिंडली (Left Calf)",
        bn: "বাম পায়ের কাফ (Left Calf)",
        mr: "डावी पोटरी (Left Calf)",
        ta: "இடது பின்னங்கால் (Left Calf)",
        te: "ఎడమ పిక్క (Left Calf)",
        gu: "ડાબી પિંડી (Left Calf)",
        kn: "ಎಡ ಹಿಂಗಾಲು (Left Calf)",
        ml: "ഇടത് പിൻകാല് (Left Calf)",
        pa: "ਖੱਬੀ ਪਿੰਨੀ (Left Calf)",
        od: "ବାମ ଗୋଡ଼ ପଛପଟ (Left Calf)",
      },
    },
    {
      id: "right_lower_leg_back",
      value: "Problem in Right Calf / Back of Leg",
      center: { x: 186, y: 546 },
      labels: {
        en: "Right Calf",
        hi: "दाईं पिंडली (Right Calf)",
        bn: "ডান পায়ের কাফ (Right Calf)",
        mr: "उजवी पोटरी (Right Calf)",
        ta: "வலது பின்னங்கால் (Right Calf)",
        te: "కుడి పిక్క (Right Calf)",
        gu: "જમણી પિંડી (Right Calf)",
        kn: "ಬಲ ಹಿಂಗಾಲು (Right Calf)",
        ml: "വലത് പിൻകാല് (Right Calf)",
        pa: "ਸੱਜੀ ਪਿੰਨੀ (Right Calf)",
        od: "ଡାହାଣ ଗୋଡ଼ ପଛପଟ (Right Calf)",
      },
    },
    {
      id: "left_foot_back",
      value: "Problem in Left Heel / Achilles",
      center: { x: 128, y: 610 },
      labels: {
        en: "Left Heel",
        hi: "बाईं एड़ी (Left Heel)",
        bn: "বাম গোড়ালি (Left Heel)",
        mr: "डावी टाच (Left Heel)",
        ta: "இடது குதிகால் (Left Heel)",
        te: "ఎడమ మడమ (Left Heel)",
        gu: "ડાબી એડી (Left Heel)",
        kn: "ಎಡ ಹಿಮ್ಮಡಿ (Left Heel)",
        ml: "ഇടത് കുതികാൽ (Left Heel)",
        pa: "ਖੱਬੀ ਅੱਡੀ (Left Heel)",
        od: "ବାମ ଗୋଇଠି (Left Heel)",
      },
    },
    {
      id: "right_foot_back",
      value: "Problem in Right Heel / Achilles",
      center: { x: 192, y: 610 },
      labels: {
        en: "Right Heel",
        hi: "दाईं एड़ी (Right Heel)",
        bn: "ডান গোড়ালি (Right Heel)",
        mr: "उजवी टाच (Right Heel)",
        ta: "வலது குதிகால் (Right Heel)",
        te: "కుడి మడమ (Right Heel)",
        gu: "જમણી એડી (Right Heel)",
        kn: "ಬಲ ಹಿಮ್ಮಡಿ (Right Heel)",
        ml: "വലത് കുതികാൽ (Right Heel)",
        pa: "ਸੱਜੀ ਅੱਡੀ (Right Heel)",
        od: "ଡାହାଣ ଗୋଇଠି (Right Heel)",
      },
    },
  ],
};

/**
 * Normalizes language codes like 'hi-IN' or 'hi' to matching dictionary key
 */
function getLangKey(code) {
  if (!code) return "en";
  const prefix = code.split("-")[0].toLowerCase();
  if (prefix === "or") return "od"; // Odia alias
  return UI_TRANSLATIONS[prefix] ? prefix : "en";
}

/**
 * Anatomical Front Body SVG View
 */
function FrontBodySVG({ selectedPartId, hoveredPartId, onSelectPart, onHoverPart, getPartLabel }) {
  const parts = BODY_PARTS.front;
  const isSelected = (id) => selectedPartId === id;

  const renderRegion = (id, pathD, label, touchRadiusD = null) => {
    const selected = isSelected(id);
    const hovered = hoveredPartId === id;
    const partObj = parts.find((p) => p.id === id);

    return (
      <g
        key={id}
        id={`front-${id}`}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={selected}
        onMouseEnter={() => onHoverPart && onHoverPart(partObj)}
        onMouseLeave={() => onHoverPart && onHoverPart(null)}
        onFocus={() => onHoverPart && onHoverPart(partObj)}
        onBlur={() => onHoverPart && onHoverPart(null)}
        onTouchStart={() => onHoverPart && onHoverPart(partObj)}
        onClick={() => {
          if (partObj) onSelectPart(partObj);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (partObj) onSelectPart(partObj);
          }
        }}
        className="group cursor-pointer outline-none transition-all duration-200"
      >
        {/* Expanded touch target path (invisible) */}
        {touchRadiusD && (
          <path
            d={touchRadiusD}
            fill="transparent"
            stroke="transparent"
            strokeWidth="16"
            className="cursor-pointer"
          />
        )}

        {/* Visible Anatomical Region */}
        <path
          d={pathD}
          className={`transition-all duration-150 ${selected
            ? "fill-[#0c5e5b] stroke-[#ffffff] stroke-[2.5px] drop-shadow-[0_0_8px_rgba(12,94,91,0.6)]"
            : hovered
              ? "fill-[#b5e8dd] stroke-[#0c5e5b] stroke-[2.2px] drop-shadow-[0_2px_6px_rgba(12,94,91,0.3)]"
              : "fill-[#eef7f5] stroke-[#99cfc5] stroke-[1.5px] group-hover:fill-[#b5e8dd] group-hover:stroke-[#0c5e5b] group-focus-visible:fill-[#b5e8dd] group-focus-visible:stroke-[#0c5e5b]"
            }`}
        />

        {/* Selected target indicator beacon */}
        {selected && (
          <circle
            cx={partObj?.center?.x || 160}
            cy={partObj?.center?.y || 160}
            r="4.5"
            fill="#ffffff"
            stroke="#0c5e5b"
            strokeWidth="2.5"
            className="pointer-events-none animate-pulse"
          />
        )}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 320 640"
      className="h-full max-h-[500px] w-auto select-none overflow-visible"
      aria-label="Human body front view anatomy map"
    >
      <defs>
        <filter id="glow-front" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0c5e5b" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Soft full-body silhouette for better human proportion */}
      <path
        d="M160 20
           C138 20 126 34 126 56
           C126 78 134 96 144 112
           C144 118 146 126 146 136
           C128 140 100 152 88 166
           C72 184 62 228 60 270
           C58 302 50 336 44 354
           C42 360 48 370 58 370
           C68 370 78 352 84 334
           C90 310 96 278 100 254
           C108 254 116 254 120 254
           C114 290 106 336 108 386
           C110 430 114 464 114 486
           C114 514 118 552 120 582
           C120 592 112 602 110 612
           C108 620 118 626 134 624
           C146 622 148 606 148 588
           C148 548 150 504 150 458
           C152 406 154 352 154 316
           L166 316
           C166 352 168 406 170 458
           C170 504 172 548 172 588
           C172 606 174 622 186 624
           C202 626 212 620 210 612
           C208 602 200 592 200 582
           C202 552 206 514 206 486
           C206 464 210 430 212 386
           C214 336 206 290 200 254
           C204 254 212 254 220 254
           C224 278 230 310 236 334
           C242 352 252 370 262 370
           C272 370 278 360 276 354
           C270 336 262 302 260 270
           C258 228 248 184 232 166
           C220 152 192 140 174 136
           C174 126 176 118 176 112
           C186 96 194 78 194 56
           C194 34 182 20 160 20 Z"
        fill="#f4fbf9"
        stroke="#d5ede7"
        strokeWidth="1"
        className="pointer-events-none"
      />

      {/* 1. Head / Scalp – more natural oval */}
      {renderRegion(
        "head",
        "M134 54 C134 28 145 20 160 20 C175 20 186 28 186 54 C186 68 182 78 176 82 C168 86 152 86 144 82 C138 78 134 68 134 54 Z",
        getPartLabel("head"),
        "M128 16 H192 V88 H128 Z"
      )}

      {/* 2. Face – rounded chin / jaw */}
      {renderRegion(
        "face",
        "M144 82 C152 86 168 86 176 82 C182 86 186 98 182 112 C178 124 168 130 160 130 C152 130 142 124 138 112 C134 98 138 86 144 82 Z",
        getPartLabel("face"),
        "M132 80 H188 V134 H132 Z"
      )}

      {/* 3. Neck – gentle taper */}
      {renderRegion(
        "neck",
        "M148 130 C154 130 166 130 172 130 L176 148 C168 154 152 154 144 148 Z",
        getPartLabel("neck"),
        "M138 126 H182 V158 H138 Z"
      )}

      {/* 4. Right Shoulder (anatomical right = viewer left) */}
      {renderRegion(
        "right_shoulder",
        "M144 148 C128 152 106 160 90 172 C84 178 80 190 80 202 C94 206 112 198 126 186 L138 176 Z",
        getPartLabel("right_shoulder")
      )}

      {/* 5. Left Shoulder */}
      {renderRegion(
        "left_shoulder",
        "M176 148 C192 152 214 160 230 172 C236 178 240 190 240 202 C226 206 208 198 194 186 L182 176 Z",
        getPartLabel("left_shoulder")
      )}

      {/* 6. Chest – broader upper torso */}
      {renderRegion(
        "chest",
        "M138 176 L126 186 C118 198 114 218 114 234 C130 242 148 246 160 246 C172 246 190 242 206 234 C206 218 202 198 194 186 L182 176 C174 180 166 182 160 182 C154 182 146 180 138 176 Z",
        getPartLabel("chest")
      )}

      {/* 7. Upper Abdomen */}
      {renderRegion(
        "upper_abdomen",
        "M114 234 C114 252 116 274 120 288 C134 294 148 296 160 296 C172 296 186 294 200 288 C204 274 206 252 206 234 C190 242 172 246 160 246 C148 246 130 242 114 234 Z",
        getPartLabel("upper_abdomen")
      )}

      {/* 8. Lower Abdomen / Pelvis – natural hip curve */}
      {renderRegion(
        "lower_abdomen",
        "M120 288 C122 304 126 324 130 340 C142 348 154 352 160 352 C166 352 178 348 190 340 C194 324 198 304 200 288 C186 294 172 296 160 296 C148 296 134 294 120 288 Z",
        getPartLabel("lower_abdomen")
      )}

      {/* 9. Right Arm – more natural taper */}
      {renderRegion(
        "right_arm",
        "M80 202 C76 222 70 264 66 304 C64 320 62 336 60 346 L80 350 C84 334 90 294 96 254 C100 228 106 210 112 200 C100 200 88 200 80 202 Z",
        getPartLabel("right_arm")
      )}

      {/* 10. Left Arm */}
      {renderRegion(
        "left_arm",
        "M240 202 C244 222 250 264 254 304 C256 320 258 336 260 346 L240 350 C236 334 230 294 224 254 C220 228 214 210 208 200 C220 200 232 200 240 202 Z",
        getPartLabel("left_arm")
      )}

      {/* 11. Right Hand – softer palm shape */}
      {renderRegion(
        "right_hand",
        "M60 346 C56 360 48 378 44 390 C42 396 50 402 56 398 C62 392 70 378 76 366 C80 360 82 354 84 350 Z",
        getPartLabel("right_hand"),
        "M36 338 H90 V408 H36 Z"
      )}

      {/* 12. Left Hand */}
      {renderRegion(
        "left_hand",
        "M260 346 C264 360 272 378 276 390 C278 396 270 402 264 398 C258 392 250 378 244 366 C240 360 238 354 236 350 Z",
        getPartLabel("left_hand"),
        "M230 338 H284 V408 H230 Z"
      )}

      {/* 13. Right Thigh */}
      {renderRegion(
        "right_thigh",
        "M130 340 C126 368 120 418 118 464 C126 468 140 468 150 464 C154 422 158 378 160 352 C148 350 138 346 130 340 Z",
        getPartLabel("right_thigh")
      )}

      {/* 14. Left Thigh */}
      {renderRegion(
        "left_thigh",
        "M190 340 C194 368 200 418 202 464 C194 468 180 468 170 464 C166 422 162 378 160 352 C172 350 182 346 190 340 Z",
        getPartLabel("left_thigh")
      )}

      {/* 15. Right Knee */}
      {renderRegion(
        "right_knee",
        "M118 464 C117 480 118 496 120 510 C128 514 140 514 148 510 C149 496 150 480 150 464 C140 468 126 468 118 464 Z",
        getPartLabel("right_knee"),
        "M112 458 H156 V516 H112 Z"
      )}

      {/* 16. Left Knee */}
      {renderRegion(
        "left_knee",
        "M202 464 C203 480 202 496 200 510 C192 514 180 514 172 510 C171 496 170 480 170 464 C180 468 194 468 202 464 Z",
        getPartLabel("left_knee"),
        "M164 458 H208 V516 H164 Z"
      )}

      {/* 17. Right Lower Leg */}
      {renderRegion(
        "right_lower_leg",
        "M120 510 C120 536 118 568 116 590 C126 594 138 594 146 590 C147 568 148 536 148 510 C140 514 128 514 120 510 Z",
        getPartLabel("right_lower_leg")
      )}

      {/* 18. Left Lower Leg */}
      {renderRegion(
        "left_lower_leg",
        "M200 510 C200 536 202 568 204 590 C194 594 182 594 174 590 C173 568 172 536 172 510 C180 514 192 514 200 510 Z",
        getPartLabel("left_lower_leg")
      )}

      {/* 19. Right Foot – more natural foot shape */}
      {renderRegion(
        "right_foot",
        "M116 590 C114 602 108 616 106 624 C106 632 118 636 134 634 C144 632 148 618 148 590 C138 594 126 594 116 590 Z",
        getPartLabel("right_foot"),
        "M98 586 H154 V640 H98 Z"
      )}

      {/* 20. Left Foot */}
      {renderRegion(
        "left_foot",
        "M204 590 C206 602 212 616 214 624 C214 632 202 636 186 634 C176 632 172 618 172 590 C182 594 194 594 204 590 Z",
        getPartLabel("left_foot"),
        "M166 586 H222 V640 H166 Z"
      )}

      {/* Dynamic Hover Tooltip attached directly to the hovered anatomical part */}
      {(() => {
        if (!hoveredPartId) return null;
        const partObj = parts.find((p) => p.id === hoveredPartId);
        if (!partObj?.center) return null;

        const labelText = getPartLabel(hoveredPartId);
        const pillWidth = Math.max(80, Math.min(220, labelText.length * 8 + 24));
        const cx = partObj.center.x;
        const cy = partObj.center.y;
        const pillX = Math.max(pillWidth / 2 + 10, Math.min(320 - pillWidth / 2 - 10, cx));
        const pillY = cy > 55 ? cy - 22 : cy + 28;

        return (
          <g pointerEvents="none" className="transition-all duration-200">
            <circle cx={cx} cy={cy} r="3" fill="#2dd4bf" className="animate-ping opacity-75" />
            <circle cx={cx} cy={cy} r="3" fill="#0c5e5b" />
            <rect
              x={pillX - pillWidth / 2}
              y={pillY - 14}
              width={pillWidth}
              height="28"
              rx="14"
              fill="#0f172a"
              stroke="#2dd4bf"
              strokeWidth="1.5"
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
            />
            <text
              x={pillX}
              y={pillY + 4}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="700"
              letterSpacing="0.2px"
            >
              {labelText}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

/**
 * Anatomical Back Body SVG View
 */
function BackBodySVG({ selectedPartId, hoveredPartId, onSelectPart, onHoverPart, getPartLabel }) {
  const parts = BODY_PARTS.back;
  const isSelected = (id) => selectedPartId === id;

  const renderRegion = (id, pathD, label, touchRadiusD = null) => {
    const selected = isSelected(id);
    const hovered = hoveredPartId === id;
    const partObj = parts.find((p) => p.id === id);

    return (
      <g
        key={id}
        id={`back-${id}`}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={selected}
        onMouseEnter={() => onHoverPart && onHoverPart(partObj)}
        onMouseLeave={() => onHoverPart && onHoverPart(null)}
        onFocus={() => onHoverPart && onHoverPart(partObj)}
        onBlur={() => onHoverPart && onHoverPart(null)}
        onTouchStart={() => onHoverPart && onHoverPart(partObj)}
        onClick={() => {
          if (partObj) onSelectPart(partObj);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (partObj) onSelectPart(partObj);
          }
        }}
        className="group cursor-pointer outline-none transition-all duration-200"
      >
        {/* Expanded touch target path (invisible) */}
        {touchRadiusD && (
          <path
            d={touchRadiusD}
            fill="transparent"
            stroke="transparent"
            strokeWidth="16"
            className="cursor-pointer"
          />
        )}

        {/* Visible Anatomical Region */}
        <path
          d={pathD}
          className={`transition-all duration-150 ${selected
            ? "fill-[#0c5e5b] stroke-[#ffffff] stroke-[2.5px] drop-shadow-[0_0_8px_rgba(12,94,91,0.6)]"
            : hovered
              ? "fill-[#b5e8dd] stroke-[#0c5e5b] stroke-[2.2px] drop-shadow-[0_2px_6px_rgba(12,94,91,0.3)]"
              : "fill-[#eef7f5] stroke-[#99cfc5] stroke-[1.5px] group-hover:fill-[#b5e8dd] group-hover:stroke-[#0c5e5b] group-focus-visible:fill-[#b5e8dd] group-focus-visible:stroke-[#0c5e5b]"
            }`}
        />

        {/* Selected target indicator beacon */}
        {selected && (
          <circle
            cx={partObj?.center?.x || 160}
            cy={partObj?.center?.y || 160}
            r="4.5"
            fill="#ffffff"
            stroke="#0c5e5b"
            strokeWidth="2.5"
            className="pointer-events-none animate-pulse"
          />
        )}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 320 640"
      className="h-full max-h-[500px] w-auto select-none overflow-visible"
      aria-label="Human body back view anatomy map"
    >
      <defs>
        <filter id="glow-back" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0c5e5b" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Soft full-body silhouette (same proportions as front) */}
      <path
        d="M160 20
           C138 20 126 34 126 56
           C126 78 134 96 144 112
           C144 118 146 126 146 136
           C128 140 100 152 88 166
           C72 184 62 228 60 270
           C58 302 50 336 44 354
           C42 360 48 370 58 370
           C68 370 78 352 84 334
           C90 310 96 278 100 254
           C108 254 116 254 120 254
           C114 290 106 336 108 386
           C110 430 114 464 114 486
           C114 514 118 552 120 582
           C120 592 112 602 110 612
           C108 620 118 626 134 624
           C146 622 148 606 148 588
           C148 548 150 504 150 458
           C152 406 154 352 154 316
           L166 316
           C166 352 168 406 170 458
           C170 504 172 548 172 588
           C172 606 174 622 186 624
           C202 626 212 620 210 612
           C208 602 200 592 200 582
           C202 552 206 514 206 486
           C206 464 210 430 212 386
           C214 336 206 290 200 254
           C204 254 212 254 220 254
           C224 278 230 310 236 334
           C242 352 252 370 262 370
           C272 370 278 360 276 354
           C270 336 262 302 260 270
           C258 228 248 184 232 166
           C220 152 192 140 174 136
           C174 126 176 118 176 112
           C186 96 194 78 194 56
           C194 34 182 20 160 20 Z"
        fill="#f4fbf9"
        stroke="#d5ede7"
        strokeWidth="1"
        className="pointer-events-none"
      />

      {/* 1. Head (Back / Occiput) – fuller rear skull */}
      {renderRegion(
        "head_back",
        "M134 52 C134 26 145 20 160 20 C175 20 186 26 186 52 C186 82 182 112 174 120 C166 122 154 122 146 120 C138 112 134 82 134 52 Z",
        getPartLabel("head_back"),
        "M128 16 H192 V124 H128 Z"
      )}

      {/* 2. Neck (Back) */}
      {renderRegion(
        "neck_back",
        "M146 120 C154 120 166 120 174 120 L176 146 C168 152 152 152 144 146 Z",
        getPartLabel("neck_back"),
        "M138 116 H182 V156 H138 Z"
      )}

      {/* 3. Left Shoulder Back (viewer left) */}
      {renderRegion(
        "left_shoulder_back",
        "M144 146 C128 150 106 158 90 170 C84 176 80 188 80 200 C94 204 112 196 126 184 L138 174 Z",
        getPartLabel("left_shoulder_back")
      )}

      {/* 4. Right Shoulder Back */}
      {renderRegion(
        "right_shoulder_back",
        "M176 146 C192 150 214 158 230 170 C236 176 240 188 240 200 C226 204 208 196 194 184 L182 174 Z",
        getPartLabel("right_shoulder_back")
      )}

      {/* 5. Upper Back */}
      {renderRegion(
        "upper_back",
        "M138 174 L126 184 C118 196 114 216 114 232 C130 240 148 244 160 244 C172 244 190 240 206 232 C206 216 202 196 194 184 L182 174 C174 178 166 180 160 180 C154 180 146 178 138 174 Z",
        getPartLabel("upper_back")
      )}

      {/* 6. Middle Back */}
      {renderRegion(
        "middle_back",
        "M114 232 C114 250 116 272 120 286 C134 292 148 294 160 294 C172 294 186 292 200 286 C204 272 206 250 206 232 C190 240 172 244 160 244 C148 244 130 240 114 232 Z",
        getPartLabel("middle_back")
      )}

      {/* 7. Lower Back / Lumbar */}
      {renderRegion(
        "lower_back",
        "M120 286 C122 302 126 322 130 338 C142 346 154 350 160 350 C166 350 178 346 190 338 C194 322 198 302 200 286 C186 292 172 294 160 294 C148 294 134 292 120 286 Z",
        getPartLabel("lower_back")
      )}

      {/* 8. Left Arm Back */}
      {renderRegion(
        "left_arm_back",
        "M80 200 C76 220 70 262 66 302 C64 318 62 334 60 344 L80 348 C84 332 90 292 96 252 C100 226 106 208 112 198 C100 198 88 198 80 200 Z",
        getPartLabel("left_arm_back")
      )}

      {/* 9. Right Arm Back */}
      {renderRegion(
        "right_arm_back",
        "M240 200 C244 220 250 262 254 302 C256 318 258 334 260 344 L240 348 C236 332 230 292 224 252 C220 226 214 208 208 198 C220 198 232 198 240 200 Z",
        getPartLabel("right_arm_back")
      )}

      {/* 10. Left Hand Back */}
      {renderRegion(
        "left_hand_back",
        "M60 344 C56 358 48 376 44 388 C42 394 50 400 56 396 C62 390 70 376 76 364 C80 358 82 352 84 348 Z",
        getPartLabel("left_hand_back"),
        "M36 336 H90 V406 H36 Z"
      )}

      {/* 11. Right Hand Back */}
      {renderRegion(
        "right_hand_back",
        "M260 344 C264 358 272 376 276 388 C278 394 270 400 264 396 C258 390 250 376 244 364 C240 358 238 352 236 348 Z",
        getPartLabel("right_hand_back"),
        "M230 336 H284 V406 H230 Z"
      )}

      {/* 12. Left Thigh Back */}
      {renderRegion(
        "left_thigh_back",
        "M130 338 C126 366 120 416 118 462 C126 466 140 466 150 462 C154 420 158 376 160 350 C148 348 138 344 130 338 Z",
        getPartLabel("left_thigh_back")
      )}

      {/* 13. Right Thigh Back */}
      {renderRegion(
        "right_thigh_back",
        "M190 338 C194 366 200 416 202 462 C194 466 180 466 170 462 C166 420 162 376 160 350 C172 348 182 344 190 338 Z",
        getPartLabel("right_thigh_back")
      )}

      {/* 14. Left Knee Back */}
      {renderRegion(
        "left_knee_back",
        "M118 462 C117 478 118 494 120 508 C128 512 140 512 148 508 C149 494 150 478 150 462 C140 466 126 466 118 462 Z",
        getPartLabel("left_knee_back"),
        "M112 456 H156 V514 H112 Z"
      )}

      {/* 15. Right Knee Back */}
      {renderRegion(
        "right_knee_back",
        "M202 462 C203 478 202 494 200 508 C192 512 180 512 172 508 C171 494 170 478 170 462 C180 466 194 466 202 462 Z",
        getPartLabel("right_knee_back"),
        "M164 456 H208 V514 H164 Z"
      )}

      {/* 16. Left Calf / Lower Leg Back */}
      {renderRegion(
        "left_lower_leg_back",
        "M120 508 C120 534 118 566 116 588 C126 592 138 592 146 588 C147 566 148 534 148 508 C140 512 128 512 120 508 Z",
        getPartLabel("left_lower_leg_back")
      )}

      {/* 17. Right Calf / Lower Leg Back */}
      {renderRegion(
        "right_lower_leg_back",
        "M200 508 C200 534 202 566 204 588 C194 592 182 592 174 588 C173 566 172 534 172 508 C180 512 192 512 200 508 Z",
        getPartLabel("right_lower_leg_back")
      )}

      {/* 18. Left Heel */}
      {renderRegion(
        "left_foot_back",
        "M116 588 C114 600 108 614 106 622 C106 630 118 634 134 632 C144 630 148 616 148 588 C138 592 126 592 116 588 Z",
        getPartLabel("left_foot_back"),
        "M98 584 H154 V638 H98 Z"
      )}

      {/* 19. Right Heel */}
      {renderRegion(
        "right_foot_back",
        "M204 588 C206 600 212 614 214 622 C214 630 202 634 186 632 C176 630 172 616 172 588 C182 592 194 592 204 588 Z",
        getPartLabel("right_foot_back"),
        "M166 584 H222 V638 H166 Z"
      )}

      {/* Dynamic Hover Tooltip attached directly to the hovered anatomical part */}
      {(() => {
        if (!hoveredPartId) return null;
        const partObj = parts.find((p) => p.id === hoveredPartId);
        if (!partObj?.center) return null;

        const labelText = getPartLabel(hoveredPartId);
        const pillWidth = Math.max(80, Math.min(220, labelText.length * 8 + 24));
        const cx = partObj.center.x;
        const cy = partObj.center.y;
        const pillX = Math.max(pillWidth / 2 + 10, Math.min(320 - pillWidth / 2 - 10, cx));
        const pillY = cy > 55 ? cy - 22 : cy + 28;

        return (
          <g pointerEvents="none" className="transition-all duration-200">
            <circle cx={cx} cy={cy} r="3" fill="#2dd4bf" className="animate-ping opacity-75" />
            <circle cx={cx} cy={cy} r="3" fill="#0c5e5b" />
            <rect
              x={pillX - pillWidth / 2}
              y={pillY - 14}
              width={pillWidth}
              height="28"
              rx="14"
              fill="#0f172a"
              stroke="#2dd4bf"
              strokeWidth="1.5"
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
            />
            <text
              x={pillX}
              y={pillY + 4}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="700"
              letterSpacing="0.2px"
            >
              {labelText}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

/**
 * Main Reusable BodyMap Modal Component
 */
export function BodyMap({
  open,
  onClose,
  onSelect,
  language = "en",
  className = "",
}) {
  const [view, setView] = useState("front"); // 'front' | 'back'
  const [selectedPart, setSelectedPart] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);
  const titleId = useId();

  if (!open) return null;

  const langKey = getLangKey(language);
  const t = UI_TRANSLATIONS[langKey] || UI_TRANSLATIONS.en;

  const getPartLabel = (partId, customView = view) => {
    const list = BODY_PARTS[customView] || BODY_PARTS.front;
    const item = list.find((p) => p.id === partId);
    if (!item) return partId;
    return item.labels[langKey] || item.labels.en || item.id;
  };

  const handleSelectPart = (partObj) => {
    setSelectedPart(partObj);
  };

  const handleContinue = () => {
    if (!selectedPart) return;
    const label = selectedPart.labels[langKey] || selectedPart.labels.en;
    const labelEn = selectedPart.labels.en;
    onSelect({
      id: selectedPart.id,
      value: selectedPart.value || `Problem in ${labelEn}`,
      label: label,
      labelEn: labelEn,
      view: view,
    });
  };

  const currentLabel = selectedPart
    ? selectedPart.labels[langKey] || selectedPart.labels.en
    : null;

  const hoveredLabel = hoveredPart
    ? hoveredPart.labels[langKey] || hoveredPart.labels.en
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 ${className}`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative flex max-h-[92vh] sm:max-h-[88vh] w-full max-w-sm sm:max-w-md md:max-w-lg flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-[#bcded7] bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#eef7f5] px-4 py-3 sm:px-5 sm:py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid size-9 sm:size-10 place-items-center rounded-xl bg-[#0c5e5b] text-white shadow-sm shrink-0">
              <User className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0">
              <h2 id={titleId} className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
                {t.modalTitle}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-600 truncate">{t.modalSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close body map"
            className="grid size-8 sm:size-9 place-items-center rounded-full text-gray-500 hover:bg-white hover:text-gray-900 transition cursor-pointer shrink-0"
          >
            <X className="size-4 sm:size-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-2 sm:px-5 sm:py-2.5 shrink-0">
          <div className="mx-auto flex max-w-xs items-center justify-center rounded-xl bg-gray-200/80 p-1">
            <button
              type="button"
              onClick={() => {
                setView("front");
                setHoveredPart(null);
              }}
              className={`flex-1 rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${view === "front"
                ? "bg-white text-[#0c5e5b] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              {t.frontView}
            </button>
            <button
              type="button"
              onClick={() => {
                setView("back");
                setHoveredPart(null);
              }}
              className={`flex-1 rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${view === "back"
                ? "bg-white text-[#0c5e5b] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              {t.backView}
            </button>
          </div>
        </div>

        {/* Body Map SVG Canvas (Scrollable Container) */}
        <div className="relative flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-[#f9fdfc] to-white p-3 sm:p-5 max-h-[55vh] sm:max-h-[60vh]">
          {/* Inner Relative Wrapper */}
          <div className="relative mx-auto flex min-h-[480px] sm:min-h-[520px] w-full max-w-[320px] sm:max-w-[340px] items-center justify-center py-2">
            {/* SVG Anatomical Map */}
            {view === "front" ? (
              <FrontBodySVG
                selectedPartId={selectedPart?.id}
                hoveredPartId={hoveredPart?.id}
                onSelectPart={handleSelectPart}
                onHoverPart={setHoveredPart}
                getPartLabel={(id) => getPartLabel(id, "front")}
              />
            ) : (
              <BackBodySVG
                selectedPartId={selectedPart?.id}
                hoveredPartId={hoveredPart?.id}
                onSelectPart={handleSelectPart}
                onHoverPart={setHoveredPart}
                getPartLabel={(id) => getPartLabel(id, "back")}
              />
            )}

            
          </div>
        </div>

        {/* Bottom Selection Bar & Actions */}
        <div className="border-t border-gray-100 bg-white p-3.5 sm:p-5 shrink-0">
          {/* Selected part banner */}
          <div
            className={`mb-3 flex items-center justify-between rounded-xl sm:rounded-2xl border px-3.5 py-2.5 sm:px-4 sm:py-3 transition-colors ${selectedPart
              ? "border-[#bcded7] bg-[#eef7f5] text-[#0c5e5b]"
              : "border-gray-200 bg-gray-50 text-gray-500"
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Crosshair
                className={`size-4 sm:size-5 shrink-0 ${selectedPart ? "text-[#0c5e5b]" : "text-gray-400"
                  }`}
              />
              <div className="min-w-0">
                <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {t.selectedPrefix}
                </span>
                <span className="block truncate text-sm sm:text-base font-bold text-gray-900">
                  {currentLabel || t.noSelection}
                </span>
              </div>
            </div>

            {selectedPart && (
              <span className="grid size-5 sm:size-6 place-items-center rounded-full bg-[#0c5e5b] text-white shrink-0">
                <Check className="size-3 sm:size-3.5" />
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="button"
              disabled={!selectedPart}
              onClick={handleContinue}
              className="flex-[2] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-[#0c5e5b] py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#084341] transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <span className="truncate">{t.continueBtn}</span>
              <ArrowRight className="size-3.5 sm:size-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BodyMap;