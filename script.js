function generateRandomNumbers() {
    var lowerBound = Math.max(1, parseInt($("#lowerBound").val()));
    var upperBound = Math.min(100, parseInt($("#upperBound").val()));
    var numOfIntegers = Math.min(parseInt($("#numOfIntegers").val()), Math.max(1, upperBound - lowerBound + 1));
    var uniqueIntegers = new Set();

    isValid = validateInput(numOfIntegers, lowerBound, upperBound);
    if (!isValid) {
        alert("Please enter valid numbers for all fields.");
        return;
    }

    localStorage.setItem("numOfIntegers", numOfIntegers);
    localStorage.setItem("lowerBound", lowerBound);
    localStorage.setItem("upperBound", upperBound);

    while (uniqueIntegers.size < numOfIntegers) {
        var randomInt = Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
        uniqueIntegers.add(randomInt);
    }

    localStorage.setItem("randomNumbers", JSON.stringify(Array.from(uniqueIntegers)));
}

function displayRandomNumbers() {
    const numbers = JSON.parse(localStorage.getItem("randomNumbers"));
    if(!possibleToPlay()) {
        return
    }
    $("#randomNumbers").val(numbers.join(", "));
}

function validateInput(numOfIntegers, lowerBound, upperBound) {
    if (isNaN(numOfIntegers) || isNaN(lowerBound) || isNaN(upperBound)) {
        alert("Please enter valid numbers for all fields.");
        return false;
    }

    if(numOfIntegers > upperBound - lowerBound + 1) {
        alert("The number of integers must be less than or equal to the range of integers.");
        return false;
    }

    if (numOfIntegers < 1 || numOfIntegers > 100) {
        alert("Please enter a number between 1 and 100 for the number of integers.");
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

function lockPlaySoundButton() {
    $("#playSounds")
    .prop("disabled", true)
    .addClass("cursor-not-allowed");
    return true;
}

function unlockPlaySoundButton() {
    $("#playSounds")
    .prop("disabled", false)
    .removeClass("cursor-not-allowed");
    return false;
}


var playSoundButtonIsLocked = unlockPlaySoundButton();

function playSound() {
    var numbers = JSON.parse(localStorage.getItem("randomNumbers"));
    if (!possibleToPlay()) {
        return;
    }

    function playSoundSequentially(numbers) {
        var index = 0;

        function playNextSound() {
            if (index >= numbers.length) {
                playSoundButtonIsLocked = unlockPlaySoundButton();
                return;
            }

            var number = numbers[index];
            var soundFile = "./zehlen-von-01-bis-100/zahl-" + number + ".mp3";
            var audio = new Audio(soundFile);
            audio.play();

            audio.onended = function () {
                index++;
                playNextSound();
            };
        }

        playNextSound();
    }

    if (!playSoundButtonIsLocked) {
        playSoundButtonIsLocked = lockPlaySoundButton();
        playSoundSequentially(numbers);
    }
}

function stopSound() {
    var audioElements = document.getElementsByTagName("audio");
    for (var i = 0; i < audioElements.length; i++) {
        audioElements[i].pause();
        audioElements[i].currentTime = 0;
    }
}

function possibleToPlay() {
    var numbers = JSON.parse(localStorage.getItem("randomNumbers"));
    if(numbers == null) {
        $("#playSounds").addClass("cursor-not-allowed"); // Add the "invisible" class to hide the button
        return false;
    }
    $("#playSounds").removeClass("cursor-not-allowed"); // Add the "invisible" class to hide the button
    return true;
}

$(document).ready(function() {
    displayRandomNumbers();
    $("#generateRandomNumbers").click(function() {
        generateRandomNumbers();
        displayRandomNumbers();
    });
    $("#playSounds").click(playSound);
    $("#stopSounds").click(stopSound);

    $("#numOfIntegers").val(localStorage.getItem("numOfIntegers") ?? 30);
    $("#lowerBound").val(localStorage.getItem("lowerBound") ?? 1);
    $("#upperBound").val(localStorage.getItem("upperBound") ?? 100);
});
