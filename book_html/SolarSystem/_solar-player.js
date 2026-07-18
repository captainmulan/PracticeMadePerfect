(function (w) {
  var BOOK = "solarsystem";
  function key(name) {
    return "book:" + BOOK + ":" + name;
  }
  w.SolarPlayer = {
    getUserName: function () {
      return localStorage.getItem(key("userName")) || localStorage.getItem("userName") || "Explorer";
    },
    getCharacter: function () {
      return localStorage.getItem(key("userCharacter")) || localStorage.getItem("userCharacter") || "👨‍🚀";
    },
    getCharacterName: function () {
      return localStorage.getItem(key("characterName")) || localStorage.getItem("characterName") || "Astronaut";
    },
    save: function (name, character, characterName) {
      localStorage.setItem(key("userName"), name);
      localStorage.setItem(key("userCharacter"), character);
      if (characterName != null) localStorage.setItem(key("characterName"), characterName);
      localStorage.setItem("userName", name);
      localStorage.setItem("userCharacter", character);
      if (characterName != null) localStorage.setItem("characterName", characterName);
    },
  };
})(window);
