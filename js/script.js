const fromText = document.querySelector(".from-text"),
  toText = document.querySelector(".to-text"),
  swapBtn = document.querySelector(".swap"),
  selectTag = document.querySelectorAll("select"),
  translateBtn = document.querySelector("#translate"),
  startButton = document.getElementById("start"),
  stopButton = document.getElementById("stop");

// ✅ Speech Recognition Setup
let recognition = new webkitSpeechRecognition();
recognition.lang = window.navigator.language;
recognition.interimResults = true;
recognition.continuous = true;

let isRecording = false;
let finalTranscript = ""; // stores all finalized speech

// Start recording
startButton.addEventListener("click", () => {
  if (!isRecording) {
    recognition.start();
    isRecording = true;
    fromText.placeholder = "Listening...";
  }
});

// Stop recording
stopButton.addEventListener("click", () => {
  recognition.stop();
  isRecording = false;
  fromText.placeholder = "Enter text...";
});

// Handle live speech results
recognition.addEventListener("result", (event) => {
  let interimTranscript = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      // Append only finalized speech to finalTranscript
      finalTranscript += event.results[i][0].transcript + " ";
    } else {
      // Show interim results temporarily
      interimTranscript += event.results[i][0].transcript;
    }
  }

  // Combine finalized and interim transcripts in textarea
  fromText.value = finalTranscript + interimTranscript;
});

// Restart recognition if accidentally stopped
recognition.addEventListener("end", () => {
  if (isRecording) recognition.start();
});

// ✅ Copy + Speak
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("fa-copy")) {
    if (e.target.dataset.type === "to") {
      navigator.clipboard.writeText(toText.value);
      alert("✅ Translated text copied!");
    } else if (e.target.dataset.type === "from") {
      navigator.clipboard.writeText(fromText.value);
      alert("✅ Original text copied!");
    }
  } else if (e.target.classList.contains("fa-volume-up")) {
    let utterance;
    if (e.target.dataset.type === "from") {
      utterance = new SpeechSynthesisUtterance(fromText.value);
      utterance.lang = selectTag[0].value;
    } else {
      utterance = new SpeechSynthesisUtterance(toText.value);
      utterance.lang = selectTag[1].value;
    }
    speechSynthesis.speak(utterance);
  }
});

// ✅ Populate language dropdowns
selectTag.forEach((tag, id) => {
  for (let country_code in countries) {
    let selected =
      id === 0
        ? country_code === "hi-IN"
          ? "selected"
          : ""
        /* : country_code === 1 && */ : country_code === "en-GB"
        ? "selected"
        : "";
    let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
    tag.insertAdjacentHTML("beforeend", option);
  }
});

// ✅ Swap languages and text
swapBtn.addEventListener("click", () => {
  let tempText = fromText.value,
    tempLang = selectTag[0].value;
  fromText.value = toText.value;
  toText.value = tempText;
  selectTag[0].value = selectTag[1].value;
  selectTag[1].value = tempLang;
});

// ✅ Clear translation if no input
fromText.addEventListener("keyup", () => {
  if (!fromText.value) {
    toText.value = "";
  }
});

// ✅ Translate
translateBtn.addEventListener("click", () => {
  let text = fromText.value.trim(),
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;
  if (!text) return;

  toText.setAttribute("placeholder", "Translating...");

  let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      toText.value = data.responseData.translatedText;
      data.matches.forEach((data) => {
        if (data.id === 0) {
          toText.value = data.translation;
        }
      });
      toText.setAttribute("placeholder", "Translation will appear here...");
    });
});



