let words = [];


let currentWord = "";
let synth = window.speechSynthesis;
let guessedWord = "";

let playerElo = 1000; // Initial Elo rating for the player
let computerElo = 1000; // Initial Elo rating for the computer
let K = 32; // Elo rating constant

const startBtn = document.getElementById("startBtn");
const submitBtn = document.getElementById("submitBtn");
const wordDisplay = document.getElementById("wordDisplay");
const userInput = document.getElementById("userInput");
const result = document.getElementById("result");
const correctDisplay = document.getElementById("correctDisplay");
const playerEloDisplay = document.getElementById("playerElo");

function calculateEloRating(winnerElo, loserElo) {
  const expectedWinProbability = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  return Math.round(K * (1 - expectedWinProbability));
}
  
function speakWithVoice(word, voiceName) {
    let utterance = new SpeechSynthesisUtterance(word);
    let voices = speechSynthesis.getVoices();
    let selectedVoice = voices.find(voice => voice.name === voiceName);
    utterance.voice = selectedVoice || voices[0]; // Fallback to the default voice if the selected voice is not found
    utterance.rate = 0.8; // Adjust speech rate (0.1 to 10)
    utterance.pitch = 1; // Adjust pitch (0 to 2)
    utterance.volume = 1; // Adjust volume (0 to 1)
    synth.speak(utterance);
  }
  
  
  const correctSound = new Audio('correct.wav');
  const incorrectSound = new Audio('incorrect.wav');
  
  async function fetchWordList() {
    try {
      const response = await fetch("https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt");
      const data = await response.text();
      words = data.split('\n').map(word => word.trim());
    } catch (error) {
      console.error("Error fetching word list:", error);
    }
  }
  

window.addEventListener("load", fetchWordList);

let isGuessMade = false;

function getRandomWord() {
    currentWord = getRandomWordFromArray(words);
    
    // Speak the word three times with different voices, adding delays between each
    speakWithVoice(currentWord, 'Google US English');
    speakWithVoice(currentWord, 'Google UK English Female');
    speakWithWordDefinitionAndPronunciation(currentWord, 'Google US English');

    
    wordDisplay.textContent = "Guess the spelling of the word:";
    userInput.value = "";
    submitBtn.disabled = false;
    startBtn.disabled = true;
  }
  
  function getRandomWordFromArray(wordsArray) {
    return wordsArray[Math.floor(Math.random() * wordsArray.length)];
  }
  

  function checkGuess() {
    const trimmedGuessedWord = userInput.value.trim().toLowerCase();
    console.log("Guessed Word:", trimmedGuessedWord);
    console.log("Current Word:", currentWord.toLowerCase());
  
    const isCorrect = trimmedGuessedWord === currentWord.toLowerCase();
    console.log("Is Correct:", isCorrect);
  
    if (isCorrect) {
      console.log("Correct guess detected!");
      result.textContent = "Correct!";
      correctDisplay.textContent = `The correct spelling is: ${currentWord}`;
      playerElo += calculateEloRating(playerElo, computerElo);
      correctSound.play(); // Play correct sound
    } else {
      console.log("Incorrect guess detected!");
      result.textContent = "Incorrect. Try again!";
      correctDisplay.textContent = `The correct spelling is: ${currentWord}`;
      playerElo -= calculateEloRating(computerElo, playerElo);
      incorrectSound.play(); // Play incorrect sound
    }
  
    submitBtn.disabled = true;
    startBtn.disabled = false;
    updateEloDisplay();
  }

async function fetchDefinitionAndPronunciation(word) {
    try {
      const response = await fetch(`https://api.freedictionary.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${word}: ${response.statusText}`);
      }
      const data = await response.json();
  
      let definition = "";
      let partOfSpeech = "";
      let pronunciation = "";
  
      // Check if meanings array exists and has at least one element
      if (data && Array.isArray(data) && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
        // Extract the first meaning's definition
        const meaning = data[0].meanings[0];
        definition = meaning.definition || "Definition not found";
  
        // Extract the part of speech from the API response
        partOfSpeech = data[0].partOfSpeech || "Part of speech not found";
      } else {
        definition = "Definition not found";
        partOfSpeech = "Part of speech not found";
      }
  
      // Check if phonetics array exists and has at least one element
      if (data && Array.isArray(data) && data.length > 0 && data[0].phonetics && data[0].phonetics.length > 0) {
        // Extract the first phonetic's audio URL
        pronunciation = data[0].phonetics[0].audio || "";
      }
  
      return { definition, partOfSpeech, pronunciation };
    } catch (error) {
      console.error(`Error fetching data for ${word}:`, error);
      return { definition: "Error fetching definition", partOfSpeech: "", pronunciation: "" };
    }
  }
  
  
  async function speakWithWordDefinitionAndPronunciation(word, voiceName) {
    const { definition, pronunciation } = await fetchDefinitionAndPronunciation(word);
  
    const textToSpeak = `${word}. Definition: ${definition}`;
  
    // Speak the word and definition
    speakWithVoice(textToSpeak, voiceName);
  
    // If pronunciation audio is available, play it as well
    if (pronunciation) {
      setTimeout(() => {
        const audioElement = new Audio(pronunciation);
        audioElement.play();
      }, 3000);
    }
  }
  
  

  
  function updateEloDisplay() {
    // Update the Elo display on the page
    playerEloDisplay.textContent = `Player Elo: ${playerElo}`;
  
    // Save the player's Elo rating to localStorage
    localStorage.setItem('playerElo', playerElo);
  }
  
  // Load the player's Elo rating from localStorage on page load
  window.addEventListener('load', () => {
    const savedPlayerElo = localStorage.getItem('playerElo');
    if (savedPlayerElo) {
      playerElo = parseInt(savedPlayerElo);
      updateEloDisplay();
    }
  });
  

startBtn.addEventListener("click", getRandomWord);
submitBtn.addEventListener("click", checkGuess);
