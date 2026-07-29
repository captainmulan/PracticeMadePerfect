(function (w) {
  var BOOK = "exploremybody";
  function key(name) {
    return "book:" + BOOK + ":" + name;
  }
  w.BodyPlayer = {
    getUserName: function () {
      return localStorage.getItem(key("userName")) || localStorage.getItem("userName") || "Explorer";
    },
    getCharacter: function () {
      return localStorage.getItem(key("userCharacter")) || localStorage.getItem("userCharacter") || "🧒";
    },
    getCharacterName: function () {
      return localStorage.getItem(key("characterName")) || localStorage.getItem("characterName") || "Body Explorer";
    },
    save: function (name, character, characterName) {
      localStorage.setItem(key("userName"), name);
      localStorage.setItem(key("userCharacter"), character);
      if (characterName != null) localStorage.setItem(key("characterName"), characterName);
      localStorage.setItem("userName", name);
      localStorage.setItem("userCharacter", character);
      if (characterName != null) localStorage.setItem("characterName", characterName);
    },
    markWordHeard: function (chapterId, word) {
      try {
        var heard = JSON.parse(localStorage.getItem(key("heardWords")) || "[]");
        var id = chapterId + ":" + word;
        if (heard.indexOf(id) === -1) {
          heard.push(id);
          localStorage.setItem(key("heardWords"), JSON.stringify(heard));
        }
      } catch (e) { /* ignore */ }
    }
  };
})(window);
