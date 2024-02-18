const playingIsStarted = new Event("playingIsStarted");
const playingIsFinished = new Event("playingIsFinished");
const stopPlayback = new Event("stopPlayback");

class LocalStorageOverlay {
  static set numOfIntegers(value) {
    localStorage.setItem("numOfIntegers", value);
  }

  static get numOfIntegers() {
    return parseInt(localStorage.getItem("numOfIntegers") ?? 30);
  }

  static set lowerBound(value) {
    localStorage.setItem("lowerBound", value);
  }

  static get lowerBound() {
    return parseInt(localStorage.getItem("lowerBound") ?? 1);
  }

  static set upperBound(value) {
    localStorage.setItem("upperBound", value);
  }

  static get upperBound() {
    return parseInt(localStorage.getItem("upperBound") ?? 100);
  }

  static set playbackRate(value) {
    localStorage.setItem("playbackRate", value);
  }

  static get playbackRate() {
    return localStorage.getItem("playbackRate") ?? "1";
  }

  static set randomNumbers(numbers) {
    numbers = numbers.filter(function (number) {
      return number > 0 && number <= 100;
    });

    localStorage.setItem("randomNumbers", JSON.stringify(numbers));
  }

  static get randomNumbers() {
    return JSON.parse(localStorage.getItem("randomNumbers")) ?? [];
  }
}

function generateRandomNumbers(numOfIntegers, lowerBound, upperBound) {
  var uniqueIntegers = new Set();

  isValid = validateInput(numOfIntegers, lowerBound, upperBound);
  if (!isValid) {
    alert("Please enter valid numbers for all fields.");
    return;
  }

  while (uniqueIntegers.size < numOfIntegers) {
    var randomInt =
      Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
    uniqueIntegers.add(randomInt);
  }

  return Array.from(uniqueIntegers);
}

function displayRandomNumbers(randomNumbers) {
  $("#randomNumbers").val(randomNumbers.join(", "));
}

function validateInput(numOfIntegers, lowerBound, upperBound) {
  if (isNaN(numOfIntegers) || isNaN(lowerBound) || isNaN(upperBound)) {
    alert("Please enter valid numbers for all fields.");
    return false;
  }

  if (numOfIntegers > upperBound - lowerBound + 1) {
    alert(
      "The number of integers must be less than or equal to the range of integers."
    );
    return false;
  }

  if (numOfIntegers < 1 || numOfIntegers > 100) {
    alert(
      "Please enter a number between 1 and 100 for the number of integers."
    );
    return false;
  }

  if (lowerBound < 1 || lowerBound > 100) {
    alert("Please enter a number between 1 and 100 for the lower bound.");
    return false;
  }

  if (upperBound < 1 || upperBound > 100) {
    alert("Please enter a number between 1 and 100 for the upper bound.");
    return false;
  }

  if (lowerBound > upperBound) {
    alert("The lower bound must be less than or equal to the upper bound.");
    return false;
  }

  return true;
}

class Modal {
  static toggle(modalId = "modal-id") {
    const modal = $("#" + modalId);
    if (modal.hasClass("hidden")) {
      Modal.showModal(modal);
    } else {
      Modal.hideModal(modal);
    }
  }

  static hide(modalId = "modal-id") {
    const modal = $("#" + modalId);
    modal.addClass("hidden");
  }

  static show(modalId = "modal-id") {
    const modal = $("#" + modalId);
    modal.removeClass("hidden");
  }
}

class SoundController {
  static lockSoundControlls() {
    $("#playSounds, #playbackRate, #stopSounds")
      .prop("disabled", true)
      .addClass("cursor-not-allowed");
  }

  static unlockSoundControlls() {
    $("#playSounds, #playbackRate, #stopSounds")
      .prop("disabled", false)
      .removeClass("cursor-not-allowed");
  }
}

function playSound(numbers, playbackRate, callback) {
  var index = 0;

  function playNextSound() {
    if (index >= numbers.length) {
      document.dispatchEvent(playingIsFinished);
      return;
    }
    document.dispatchEvent(playingIsStarted);

    var number = numbers[index];
    var soundFile = "./zehlen-von-01-bis-100/zahl-" + number + ".mp3";
    var audio = new Audio(soundFile);
    audio.playbackRate = playbackRate;

    callback(number, audio).then((result) => {
      //   if (result.stop !== true) {
      audio.play();
      //   }
    });

    audio.onended = function () {
      index++;
      playNextSound();
    };
  }

  playNextSound();
}

function stopSound(audio) {
  audio.pause();
  audio.stop = true;
}

function possibleToPlay() {
  var numbers = LocalStorageOverlay.randomNumbers;
  if (numbers.length === 0) {
    $("#playSounds").addClass("cursor-not-allowed");
    return false;
  }
  $("#playSounds").removeClass("cursor-not-allowed");
  return true;
}

function initializeThePage() {
  displayRandomNumbers(LocalStorageOverlay.randomNumbers);

  $("#playbackRate").val(LocalStorageOverlay.playbackRate);
  $("#playbackSpeedValue").text(LocalStorageOverlay.playbackRate);

  $("#numOfIntegers").val(LocalStorageOverlay.numOfIntegers);
  $("#lowerBound").val(LocalStorageOverlay.lowerBound);
  $("#upperBound").val(LocalStorageOverlay.upperBound);
}

document.addEventListener("playingIsStarted", () => {
  SoundController.lockSoundControlls();
  Modal.show("modal-id");
});

document.addEventListener("playingIsFinished", () => {
  SoundController.unlockSoundControlls();
  Modal.hide("modal-id");
});

document.addEventListener("stopPlayback", (event) => {
  console.log("stopPlayback", {
    event,
  });
  event.audio.pause();
  event.audio.stop = true;

  SoundController.unlockSoundControlls();
  Modal.hide("modal-id");
});

$(document)
  .ready(initializeThePage)
  .ready(function () {
    $("#generateRandomNumbers").click(function () {
      LocalStorageOverlay.lowerBound = Math.max(
        1,
        parseInt($("#lowerBound").val())
      );
      LocalStorageOverlay.upperBound = Math.min(
        100,
        parseInt($("#upperBound").val())
      );
      LocalStorageOverlay.numOfIntegers = Math.min(
        parseInt($("#numOfIntegers").val()),
        Math.max(
          1,
          LocalStorageOverlay.upperBound - LocalStorageOverlay.lowerBound + 1
        )
      );

      LocalStorageOverlay.randomNumbers = generateRandomNumbers(
        LocalStorageOverlay.numOfIntegers,
        LocalStorageOverlay.lowerBound,
        LocalStorageOverlay.upperBound
      );

      displayRandomNumbers(LocalStorageOverlay.randomNumbers);
    });

    $("#playSounds").on("click", function () {
      if (!possibleToPlay()) {
        return;
      }
      playSound(
        LocalStorageOverlay.randomNumbers,
        LocalStorageOverlay.playbackRate,
        function (number, audio) {
          $("#modal-id #numberToShow").text(number);

          stopPlayback.audio = audio;
          return new Promise((resolve) => {
            setTimeout(() => {
              return resolve();
            }, 550);
          });
        }
      );
    });

    $("#stopPlayback").on("click", () => {
      document.dispatchEvent(stopPlayback);
    });

    $("#playbackRate").on("change", function () {
      var playbackRate = $(this).val();
      $("#playbackSpeedValue").text(playbackRate);
      LocalStorageOverlay.playbackRate = playbackRate;
    });
  });
