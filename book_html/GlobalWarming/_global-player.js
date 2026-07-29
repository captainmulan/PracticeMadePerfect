(function (w) {
  var BOOK = "globalwarming";
  function key(name) { return "book:" + BOOK + ":" + name; }
  w.GlobalPlayer = {
    getUserName: function () { return localStorage.getItem(key("userName")) || localStorage.getItem("userName") || "Explorer"; },
    getCharacter: function () { return localStorage.getItem(key("userCharacter")) || localStorage.getItem("userCharacter") || "🌍"; },
    getCharacterName: function () { return localStorage.getItem(key("characterName")) || localStorage.getItem("characterName") || "Eco Hero"; },
    save: function (name, character, characterName) {
      localStorage.setItem(key("userName"), name);
      localStorage.setItem(key("userCharacter"), character);
      if (characterName != null) localStorage.setItem(key("characterName"), characterName);
      localStorage.setItem("userName", name);
      localStorage.setItem("userCharacter", character);
      if (characterName != null) localStorage.setItem("characterName", characterName);
    },
    getBadges: function () {
      try { return JSON.parse(localStorage.getItem(key("badges")) || "[]"); }
      catch (e) { return []; }
    },
    earnBadge: function (badge) {
      var badges = this.getBadges();
      if (badges.indexOf(badge) === -1) {
        badges.push(badge);
        localStorage.setItem(key("badges"), JSON.stringify(badges));
        return true;
      }
      return false;
    }
  };
})(window);
