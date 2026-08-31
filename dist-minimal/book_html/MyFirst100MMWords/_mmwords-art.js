/* Rich static chapter hero illustrations — Myanmar themes (SVG) */
(function (w) {
  var DEFS =
    "<defs>" +
    "<linearGradient id=\"skyD\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#BAE6FD\"/><stop offset=\"55%\" stop-color=\"#E0F2FE\"/><stop offset=\"100%\" stop-color=\"#F0FDF4\"/></linearGradient>" +
    "<linearGradient id=\"skySunset\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#FDBA74\"/><stop offset=\"40%\" stop-color=\"#FED7AA\"/><stop offset=\"100%\" stop-color=\"#FFEDD5\"/></linearGradient>" +
    "<linearGradient id=\"goldPagoda\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#FDE68A\"/><stop offset=\"50%\" stop-color=\"#F59E0B\"/><stop offset=\"100%\" stop-color=\"#B45309\"/></linearGradient>" +
    "<linearGradient id=\"teakWood\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#92400E\"/><stop offset=\"100%\" stop-color=\"#78350F\"/></linearGradient>" +
    "<linearGradient id=\"waterG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#38BDF8\"/><stop offset=\"100%\" stop-color=\"#0284C7\"/></linearGradient>" +
    "<filter id=\"softSh\"><feDropShadow dx=\"0\" dy=\"3\" stdDeviation=\"4\" flood-color=\"#0F172A\" flood-opacity=\".15\"/></filter>" +
    "<filter id=\"glow\"><feGaussianBlur stdDeviation=\"3\" result=\"b\"/><feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter>" +
    "</defs>";

  function pagoda(x, y, scale, gold) {
    var s = scale || 1;
    var g = gold ? "url(#goldPagoda)" : "#D97706";
    return "<g transform=\"translate(" + x + "," + y + ") scale(" + s + ")\" filter=\"url(#softSh)\">" +
      "<polygon points=\"0,-48 28,8 20,8 24,42 -24,42 -20,8 -28,8\" fill=\"" + g + "\" stroke=\"#92400E\" stroke-width=\"1\"/>" +
      "<polygon points=\"0,-38 18,2 14,2 16,32 -16,32 -14,2 -18,2\" fill=\"#FBBF24\" opacity=\".7\"/>" +
      "<circle cx=\"0\" cy=\"-52\" r=\"5\" fill=\"#FDE68A\" filter=\"url(#glow)\"/>" +
      "<line x1=\"0\" y1=\"-48\" x2=\"0\" y2=\"-58\" stroke=\"#F59E0B\" stroke-width=\"2\"/>" +
      "</g>";
  }

  function stiltHouse(x, y, w) {
    return "<g transform=\"translate(" + x + "," + y + ")\">" +
      "<rect x=\"0\" y=\"40\" width=\"" + w + "\" height=\"8\" fill=\"url(#teakWood)\" rx=\"2\"/>" +
      "<rect x=\"8\" y=\"48\" width=\"6\" height=\"32\" fill=\"#78350F\"/><rect x=\"" + (w - 14) + "\" y=\"48\" width=\"6\" height=\"32\" fill=\"#78350F\"/>" +
      "<rect x=\"4\" y=\"0\" width=\"" + w + "\" height=\"44\" fill=\"#A16207\" stroke=\"#78350F\" stroke-width=\"2\" rx=\"4\"/>" +
      "<rect x=\"12\" y=\"10\" width=\"20\" height=\"18\" fill=\"#FEF3C7\" stroke=\"#92400E\" stroke-width=\"1\"/>" +
      "<rect x=\"" + (w - 32) + "\" y=\"10\" width=\"20\" height=\"18\" fill=\"#FEF3C7\" stroke=\"#92400E\" stroke-width=\"1\"/>" +
      "<polygon points=\"" + (w / 2) + ",-12 " + (w + 8) + ",4 0,4\" fill=\"#92400E\"/>" +
      "</g>";
  }

  function elephant(x, y, scale) {
    var s = scale || 1;
    return "<g transform=\"translate(" + x + "," + y + ") scale(" + s + ")\" filter=\"url(#softSh)\">" +
      "<ellipse cx=\"0\" cy=\"8\" rx=\"38\" ry=\"22\" fill=\"#9CA3AF\"/>" +
      "<ellipse cx=\"-28\" cy=\"-8\" rx=\"18\" ry=\"16\" fill=\"#9CA3AF\"/>" +
      "<path d=\"M-46,-4 Q-58,8 -52,22 Q-44,18 -40,8 Z\" fill=\"#9CA3AF\"/>" +
      "<circle cx=\"-32\" cy=\"-12\" r=\"3\" fill=\"#1E293B\"/>" +
      "<path d=\"M20,-2 L32,-8 L34,4 L24,8 Z\" fill=\"#FBBF24\"/>" +
      "<rect x=\"-8\" y=\"24\" width=\"6\" height=\"16\" fill=\"#6B7280\" rx=\"2\"/><rect x=\"8\" y=\"24\" width=\"6\" height=\"16\" fill=\"#6B7280\" rx=\"2\"/>" +
      "<rect x=\"-22\" y=\"24\" width=\"6\" height=\"16\" fill=\"#6B7280\" rx=\"2\"/><rect x=\"18\" y=\"24\" width=\"6\" height=\"16\" fill=\"#6B7280\" rx=\"2\"/>" +
      "</g>";
  }

  var SCENES = {
    family: function () {
      return DEFS +
        "<rect width=\"400\" height=\"300\" fill=\"url(#skyD)\"/>" +
        pagoda(320, 60, 1.1, true) +
        stiltHouse(24, 130, 100) +
        "<rect x=\"0\" y=\"248\" width=\"400\" height=\"52\" fill=\"#86EFAC\" opacity=\".5\"/>" +
        "<ellipse cx=\"200\" cy=\"260\" rx=\"180\" ry=\"14\" fill=\"#4ADE80\" opacity=\".35\"/>" +
        "<g transform=\"translate(140,155)\" filter=\"url(#softSh)\">" +
        "<rect x=\"0\" y=\"30\" width=\"120\" height=\"50\" rx=\"10\" fill=\"#64748B\"/>" +
        "<rect x=\"8\" y=\"38\" width=\"104\" height=\"34\" rx=\"6\" fill=\"#475569\"/>" +
        "</g>" +
        "<g transform=\"translate(70,118)\"><circle cx=\"0\" cy=\"0\" r=\"14\" fill=\"#F5D0A9\"/><path d=\"M-12,2 Q0,-14 12,2\" fill=\"#9CA3AF\"/><rect x=\"-12\" y=\"12\" width=\"24\" height=\"22\" rx=\"8\" fill=\"#A78BFA\"/></g>" +
        "<g transform=\"translate(110,108)\"><circle cx=\"0\" cy=\"0\" r=\"13\" fill=\"#EBC49A\"/><path d=\"M-12,0 Q0,-12 12,0 L12,8 Q0,0 -12,8 Z\" fill=\"#1E293B\"/><rect x=\"-11\" y=\"11\" width=\"22\" height=\"20\" rx=\"7\" fill=\"#1865F2\"/></g>" +
        "<g transform=\"translate(150,112)\"><circle cx=\"0\" cy=\"0\" r=\"12\" fill=\"#F0C9A0\"/><path d=\"M-11,-2 Q0,-14 11,-2 L13,16 Q0,6 -13,16 Z\" fill=\"#1E293B\"/><rect x=\"-10\" y=\"10\" width=\"20\" height=\"18\" rx=\"6\" fill=\"#F472B6\"/></g>" +
        "<g transform=\"translate(190,118)\"><circle cx=\"0\" cy=\"0\" r=\"11\" fill=\"#FFE4C4\"/><circle cx=\"0\" cy=\"-4\" r=\"9\" fill=\"#5C4033\" opacity=\".4\"/><rect x=\"-9\" y=\"9\" width=\"18\" height=\"16\" rx=\"5\" fill=\"#FBBF24\"/></g>" +
        "<g transform=\"translate(230,108)\"><circle cx=\"0\" cy=\"0\" r=\"13\" fill=\"#D4A574\"/><path d=\"M-12,0 Q0,-12 12,0\" fill=\"#1E293B\"/><rect x=\"-11\" y=\"11\" width=\"22\" height=\"20\" rx=\"7\" fill=\"#14BF96\"/></g>" +
        "<g transform=\"translate(270,118)\"><circle cx=\"0\" cy=\"0\" r=\"14\" fill=\"#F0C9A0\"/><path d=\"M-12,2 Q0,-14 12,2\" fill=\"#9CA3AF\"/><rect x=\"-12\" y=\"12\" width=\"24\" height=\"22\" rx=\"8\" fill=\"#60A5FA\"/></g>" +
        "<g transform=\"translate(175,168)\"><circle cx=\"0\" cy=\"0\" r=\"9\" fill=\"#FFE4C4\"/><rect x=\"-8\" y=\"7\" width=\"16\" height=\"14\" rx=\"5\" fill=\"#E2E8F0\"/></g>" +
        "<text x=\"200\" y=\"22\" text-anchor=\"middle\" font-size=\"12\" fill=\"#475569\" font-family=\"system-ui,sans-serif\" font-weight=\"600\">Myanmar family at home</text>" +
        "<text x=\"200\" y=\"288\" text-anchor=\"middle\" font-size=\"10\" fill=\"#64748B\" font-family=\"system-ui,sans-serif\">Grandparents · parents · children together</text>";
    },

    food: function () {
      return DEFS +
        "<rect width=\"400\" height=\"300\" fill=\"url(#skySunset)\"/>" +
        "<rect x=\"0\" y=\"220\" width=\"400\" height=\"80\" fill=\"#78716C\" opacity=\".25\"/>" +
        "<g transform=\"translate(200,175)\" filter=\"url(#softSh)\">" +
        "<ellipse cx=\"0\" cy=\"28\" rx=\"90\" ry=\"12\" fill=\"#57534E\" opacity=\".3\"/>" +
        "<rect x=\"-85\" y=\"0\" width=\"170\" height=\"28\" rx=\"6\" fill=\"#92400E\"/>" +
        "<rect x=\"-80\" y=\"-8\" width=\"160\" height=\"12\" rx=\"4\" fill=\"#78350F\"/>" +
        "</g>" +
        "<g transform=\"translate(130,148)\"><ellipse cx=\"0\" cy=\"18\" rx=\"42\" ry=\"14\" fill=\"#EA580C\" opacity=\".9\"/><ellipse cx=\"0\" cy=\"12\" rx=\"38\" ry=\"10\" fill=\"#F97316\"/><path d=\"M-20,8 Q0,0 20,8\" fill=\"none\" stroke=\"#FBBF24\" stroke-width=\"2\"/></g>" +
        "<g transform=\"translate(200,142)\"><ellipse cx=\"0\" cy=\"22\" rx=\"48\" ry=\"16\" fill=\"#FEF3C7\" stroke=\"#D97706\" stroke-width=\"2\"/><ellipse cx=\"0\" cy=\"14\" rx=\"42\" ry=\"12\" fill=\"#FFFBEB\"/><circle cx=\"-12\" cy=\"10\" r=\"4\" fill=\"#F59E0B\"/><circle cx=\"8\" cy=\"12\" r=\"3\" fill=\"#84CC16\"/></g>" +
        "<g transform=\"translate(270,150)\"><rect x=\"-18\" y=\"0\" width=\"36\" height=\"28\" rx=\"4\" fill=\"#FEF3C7\" stroke=\"#92400E\" stroke-width=\"1.5\"/><ellipse cx=\"0\" cy=\"-4\" rx=\"20\" ry=\"8\" fill=\"#86EFAC\"/></g>" +
        "<g transform=\"translate(80,130)\"><ellipse cx=\"0\" cy=\"20\" rx=\"22\" ry=\"26\" fill=\"#FEF3C7\" stroke=\"#D97706\" stroke-width=\"1.5\"/><path d=\"M-8,-8 Q0,-18 8,-8\" fill=\"#CA8A04\"/></g>" +
        "<g transform=\"translate(320,125)\" filter=\"url(#softSh)\"><rect x=\"-20\" y=\"0\" width=\"40\" height=\"32\" rx=\"4\" fill=\"#1E293B\"/><rect x=\"-16\" y=\"4\" width=\"32\" height=\"20\" rx=\"2\" fill=\"#422006\"/><ellipse cx=\"0\" cy=\"-6\" rx=\"14\" ry=\"6\" fill=\"#78350F\"/></g>" +
        "<text x=\"200\" y=\"24\" text-anchor=\"middle\" font-size=\"12\" fill=\"#92400E\" font-family=\"system-ui,sans-serif\" font-weight=\"600\">Myanmar tea shop &amp; kitchen</text>" +
        "<text x=\"200\" y=\"288\" text-anchor=\"middle\" font-size=\"10\" fill=\"#78716C\" font-family=\"system-ui,sans-serif\">Mohinga · laphet · sweet tea</text>";
    },

    animals: function () {
      return DEFS +
        "<rect width=\"400\" height=\"300\" fill=\"url(#skyD)\"/>" +
        "<rect x=\"0\" y=\"200\" width=\"400\" height=\"100\" fill=\"#166534\" opacity=\".35\"/>" +
        "<ellipse cx=\"120\" cy=\"210\" rx=\"80\" ry=\"20\" fill=\"#15803D\" opacity=\".4\"/>" +
        "<ellipse cx=\"300\" cy=\"220\" rx=\"90\" ry=\"22\" fill=\"#15803D\" opacity=\".4\"/>" +
        elephant(200, 155, 1.35) +
        "<g transform=\"translate(70,195)\" filter=\"url(#softSh)\"><ellipse cx=\"0\" cy=\"0\" rx=\"22\" ry=\"14\" fill=\"#F97316\"/><circle cx=\"-8\" cy=\"-4\" r=\"10\" fill=\"#F97316\"/><path d=\"M12,0 L22,-6 L20,6 Z\" fill=\"#F97316\"/><circle cx=\"-10\" cy=\"-6\" r=\"2\" fill=\"#1E293B\"/></g>" +
        "<g transform=\"translate(330,200)\"><ellipse cx=\"0\" cy=\"8\" rx=\"16\" ry=\"10\" fill=\"#D97706\"/><circle cx=\"0\" cy=\"0\" r=\"10\" fill=\"#D97706\"/><path d=\"M-6,-8 L-2,-16 L2,-8\" fill=\"#92400E\"/><circle cx=\"-3\" cy=\"-1\" r=\"1.5\" fill=\"#1E293B\"/></g>" +
        "<g transform=\"translate(100,120)\"><path d=\"M0,0 Q15,-20 30,0 Q15,10 0,0\" fill=\"#38BDF8\" opacity=\".8\"/><circle cx=\"15\" cy=\"-8\" r=\"4\" fill=\"#0EA5E9\"/></g>" +
        "<g transform=\"translate(310,110)\"><path d=\"M0,0 Q12,-18 24,0 Q12,8 0,0\" fill=\"#F472B6\" opacity=\".85\"/><circle cx=\"12\" cy=\"-6\" r=\"3\" fill=\"#EC4899\"/></g>" +
        pagoda(350, 45, .7, true) +
        "<text x=\"200\" y=\"22\" text-anchor=\"middle\" font-size=\"12\" fill=\"#166534\" font-family=\"system-ui,sans-serif\" font-weight=\"600\">Animals of Myanmar</text>" +
        "<text x=\"200\" y=\"288\" text-anchor=\"middle\" font-size=\"10\" fill=\"#475569\" font-family=\"system-ui,sans-serif\">Elephants · tigers · birds of the golden land</text>";
    },

    colors: function () {
      return DEFS +
        "<rect width=\"400\" height=\"300\" fill=\"url(#skySunset)\"/>" +
        pagoda(200, 95, 1.6, true) +
        "<rect x=\"0\" y=\"230\" width=\"400\" height=\"70\" fill=\"#4ADE80\" opacity=\".3\"/>" +
        "<g transform=\"translate(60,200)\" filter=\"url(#softSh)\"><rect x=\"0\" y=\"0\" width=\"28\" height=\"28\" rx=\"6\" fill=\"#DC2626\"/><rect x=\"32\" y=\"0\" width=\"28\" height=\"28\" rx=\"6\" fill=\"#2563EB\"/><rect x=\"64\" y=\"0\" width=\"28\" height=\"28\" rx=\"6\" fill=\"#16A34A\"/><rect x=\"96\" y=\"0\" width=\"28\" height=\"28\" rx=\"6\" fill=\"#CA8A04\"/></g>" +
        "<g transform=\"translate(260,195)\" filter=\"url(#softSh)\"><rect x=\"0\" y=\"0\" width=\"28\" height=\"28\" rx=\"6\" fill=\"#F8FAFC\" stroke=\"#CBD5E1\"/><rect x=\"32\" y=\"0\" width=\"28\" height=\"28\" rx=\"6\" fill=\"#1E293B\"/><rect x=\"64\" y=\"0\" width=\"28\" height=\"28\" rx=\"6\" fill=\"#EC4899\"/><rect x=\"96\" y=\"0\" width=\"28\" height=\"28\" rx=\"6\" fill=\"#7C3AED\"/></g>" +
        "<circle cx=\"80\" cy=\"140\" r=\"18\" fill=\"#F472B6\" opacity=\".7\"/><circle cx=\"320\" cy=\"130\" r=\"14\" fill=\"#FBBF24\" opacity=\".8\"/>" +
        "<text x=\"200\" y=\"22\" text-anchor=\"middle\" font-size=\"12\" fill=\"#92400E\" font-family=\"system-ui,sans-serif\" font-weight=\"600\">Colors of the golden pagoda</text>" +
        "<text x=\"200\" y=\"288\" text-anchor=\"middle\" font-size=\"10\" fill=\"#78716C\" font-family=\"system-ui,sans-serif\">Gold · saffron · festival bright hues</text>";
    },

    numbers: function () {
      return DEFS +
        "<rect width=\"400\" height=\"300\" fill=\"url(#skyD)\"/>" +
        "<rect x=\"0\" y=\"210\" width=\"400\" height=\"90\" fill=\"#D6D3D1\" opacity=\".5\"/>" +
        "<g filter=\"url(#softSh)\">" +
        pagoda(80, 130, .9, true) + pagoda(160, 120, 1, true) + pagoda(240, 125, .95, true) + pagoda(320, 135, .85, true) +
        "</g>" +
        "<g transform=\"translate(200,195)\" font-family=\"system-ui,sans-serif\" font-weight=\"700\" fill=\"#1865F2\" font-size=\"22\" text-anchor=\"middle\">" +
        "<text x=\"-90\" y=\"0\">၁</text><text x=\"-30\" y=\"0\">၂</text><text x=\"30\" y=\"0\">၃</text><text x=\"90\" y=\"0\">၄</text>" +
        "</g>" +
        "<g transform=\"translate(70,230)\"><ellipse cx=\"0\" cy=\"0\" rx=\"24\" ry=\"12\" fill=\"#F97316\" opacity=\".9\"/><ellipse cx=\"0\" cy=\"-6\" rx=\"20\" ry=\"10\" fill=\"#FB923C\"/></g>" +
        "<g transform=\"translate(130,235)\"><ellipse cx=\"0\" cy=\"0\" rx=\"20\" ry=\"10\" fill=\"#F97316\" opacity=\".9\"/></g>" +
        "<g transform=\"translate(190,228)\"><ellipse cx=\"0\" cy=\"0\" rx=\"22\" ry=\"11\" fill=\"#F97316\" opacity=\".9\"/></g>" +
        "<text x=\"200\" y=\"22\" text-anchor=\"middle\" font-size=\"12\" fill=\"#475569\" font-family=\"system-ui,sans-serif\" font-weight=\"600\">Counting at Bagan market</text>" +
        "<text x=\"200\" y=\"288\" text-anchor=\"middle\" font-size=\"10\" fill=\"#64748B\" font-family=\"system-ui,sans-serif\">Burmese numerals · mangoes · temples</text>";
    },

    body: function () {
      return DEFS +
        "<rect width=\"400\" height=\"300\" fill=\"#FDF4FF\"/>" +
        "<rect x=\"0\" y=\"240\" width=\"400\" height=\"60\" fill=\"#E9D5FF\" opacity=\".5\"/>" +
        "<g transform=\"translate(200,140)\" filter=\"url(#softSh)\">" +
        "<circle cx=\"0\" cy=\"-50\" r=\"22\" fill=\"#F5D0A9\"/>" +
        "<path d=\"M-20,-58 Q0,-78 20,-58\" fill=\"#1E293B\"/>" +
        "<ellipse cx=\"-8\" cy=\"-52\" rx=\"3\" ry=\"4\" fill=\"#1E293B\"/><ellipse cx=\"8\" cy=\"-52\" rx=\"3\" ry=\"4\" fill=\"#1E293B\"/>" +
        "<path d=\"M-6,-44 Q0,-38 6,-44\" fill=\"none\" stroke=\"#C4845C\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>" +
        "<path d=\"M-28,-20 Q-40,20 -24,60 L24,60 Q40,20 28,-20 Q0,-10 -28,-20 Z\" fill=\"#DC2626\"/>" +
        "<path d=\"M-28,-20 Q0,0 28,-20 L20,10 Q0,30 -20,10 Z\" fill=\"#FBBF24\" opacity=\".9\"/>" +
        "<circle cx=\"-32\" cy=\"-30\" r=\"8\" fill=\"#FBBF24\"/><circle cx=\"32\" cy=\"-30\" r=\"8\" fill=\"#FBBF24\"/>" +
        "<path d=\"M-40,-18 Q-55,10 -48,40\" fill=\"none\" stroke=\"#F5D0A9\" stroke-width=\"8\" stroke-linecap=\"round\"/>" +
        "<path d=\"M40,-18 Q55,10 48,40\" fill=\"none\" stroke=\"#F5D0A9\" stroke-width=\"8\" stroke-linecap=\"round\"/>" +
        "</g>" +
        "<text x=\"200\" y=\"22\" text-anchor=\"middle\" font-size=\"12\" fill=\"#7C3AED\" font-family=\"system-ui,sans-serif\" font-weight=\"600\">Burmese classical dancer</text>" +
        "<text x=\"200\" y=\"288\" text-anchor=\"middle\" font-size=\"10\" fill=\"#64748B\" font-family=\"system-ui,sans-serif\">Hands · feet · expression in traditional dance</text>";
    },

    home: function () {
      return DEFS +
        "<rect width=\"400\" height=\"300\" fill=\"url(#skyD)\"/>" +
        stiltHouse(130, 90, 140) +
        pagoda(340, 70, .8, true) +
        "<rect x=\"0\" y=\"250\" width=\"400\" height=\"50\" fill=\"#86EFAC\" opacity=\".45\"/>" +
        "<g transform=\"translate(60,200)\"><rect x=\"0\" y=\"0\" width=\"36\" height=\"48\" rx=\"3\" fill=\"#92400E\"/><rect x=\"4\" y=\"4\" width=\"28\" height=\"20\" fill=\"#FEF3C7\"/></g>" +
        "<circle cx=\"320\" cy=\"210\" r=\"16\" fill=\"#FBBF24\" filter=\"url(#glow)\" opacity=\".8\"/>" +
        "<rect x=\"305\" y=\"218\" width=\"30\" height=\"8\" fill=\"#78350F\" rx=\"2\"/>" +
        "<text x=\"200\" y=\"22\" text-anchor=\"middle\" font-size=\"12\" fill=\"#475569\" font-family=\"system-ui,sans-serif\" font-weight=\"600\">Traditional Myanmar teak house</text>" +
        "<text x=\"200\" y=\"288\" text-anchor=\"middle\" font-size=\"10\" fill=\"#64748B\" font-family=\"system-ui,sans-serif\">Stilt house · lamp · open windows</text>";
    },

    school: function () {
      return DEFS +
        "<rect width=\"400\" height=\"300\" fill=\"#EFF6FF\"/>" +
        "<rect x=\"40\" y=\"60\" width=\"320\" height=\"180\" rx=\"8\" fill=\"#FEF3C7\" stroke=\"#92400E\" stroke-width=\"2\" filter=\"url(#softSh)\"/>" +
        "<polygon points=\"200,30 360,60 40,60\" fill=\"#78350F\"/>" +
        "<rect x=\"80\" y=\"100\" width=\"240\" height=\"8\" fill=\"#92400E\" opacity=\".3\"/>" +
        "<rect x=\"100\" y=\"120\" width=\"80\" height=\"50\" rx=\"4\" fill=\"#FFFFFF\" stroke=\"#CBD5E1\"/>" +
        "<rect x=\"220\" y=\"120\" width=\"80\" height=\"50\" rx=\"4\" fill=\"#FFFFFF\" stroke=\"#CBD5E1\"/>" +
        "<line x1=\"110\" y1=\"132\" x2=\"170\" y2=\"132\" stroke=\"#1865F2\" stroke-width=\"2\"/><line x1=\"110\" y1=\"142\" x2=\"160\" y2=\"142\" stroke=\"#94A3B8\" stroke-width=\"1.5\"/>" +
        "<g transform=\"translate(160,195)\"><circle cx=\"0\" cy=\"0\" r=\"12\" fill=\"#F5D0A9\"/><rect x=\"-10\" y=\"10\" width=\"20\" height=\"18\" rx=\"5\" fill=\"#1865F2\"/></g>" +
        pagoda(30, 55, .5, true) +
        "<text x=\"200\" y=\"22\" text-anchor=\"middle\" font-size=\"12\" fill=\"#1865F2\" font-family=\"system-ui,sans-serif\" font-weight=\"600\">Monastic school &amp; village classroom</text>" +
        "<text x=\"200\" y=\"288\" text-anchor=\"middle\" font-size=\"10\" fill=\"#64748B\" font-family=\"system-ui,sans-serif\">Books · pencils · respect for teachers</text>";
    },

    feelings: function () {
      return DEFS +
        "<rect width=\"400\" height=\"300\" fill=\"#FAF5FF\"/>" +
        "<rect width=\"400\" height=\"300\" fill=\"url(#skyD)\" opacity=\".25\"/>" +
        "<g transform=\"translate(200,130)\" filter=\"url(#softSh)\">" +
        "<circle cx=\"0\" cy=\"0\" r=\"55\" fill=\"#FFFFFF\" stroke=\"#E2E8F0\" stroke-width=\"2\"/>" +
        "<text x=\"0\" y=\"-12\" text-anchor=\"middle\" font-size=\"36\">😊</text>" +
        "<text x=\"-45\" y=\"25\" font-size=\"24\">😢</text><text x=\"45\" y=\"25\" font-size=\"24\">😠</text>" +
        "<text x=\"0\" y=\"42\" text-anchor=\"middle\" font-size=\"22\">🙏</text>" +
        "</g>" +
        "<path d=\"M120,200 Q200,170 280,200\" fill=\"none\" stroke=\"#A78BFA\" stroke-width=\"2\" stroke-dasharray=\"6 4\"/>" +
        pagoda(340, 60, .6, true) +
        "<text x=\"200\" y=\"22\" text-anchor=\"middle\" font-size=\"12\" fill=\"#7C3AED\" font-family=\"system-ui,sans-serif\" font-weight=\"600\">Feelings &amp; polite speech</text>" +
        "<text x=\"200\" y=\"288\" text-anchor=\"middle\" font-size=\"10\" fill=\"#64748B\" font-family=\"system-ui,sans-serif\">Kyay-zu · sorry · sharing how you feel</text>";
    },

    festivals: function () {
      return DEFS +
        "<rect width=\"400\" height=\"300\" fill=\"#1E1B4B\"/>" +
        "<circle cx=\"200\" cy=\"80\" r=\"40\" fill=\"#FBBF24\" filter=\"url(#glow)\" opacity=\".9\"/>" +
        pagoda(200, 140, 1.2, true) +
        "<g transform=\"translate(80,180)\"><ellipse cx=\"0\" cy=\"0\" rx=\"20\" ry=\"28\" fill=\"#38BDF8\" opacity=\".7\"/><line x1=\"0\" y1=\"-28\" x2=\"0\" y2=\"-45\" stroke=\"#94A3B8\" stroke-width=\"2\"/></g>" +
        "<g transform=\"translate(320,170)\"><ellipse cx=\"0\" cy=\"0\" rx=\"18\" ry=\"26\" fill=\"#F472B6\" opacity=\".75\"/><line x1=\"0\" y1=\"-26\" x2=\"0\" y2=\"-42\" stroke=\"#94A3B8\" stroke-width=\"2\"/></g>" +
        "<g transform=\"translate(200,220)\"><circle cx=\"0\" cy=\"0\" r=\"8\" fill=\"#FDE68A\" filter=\"url(#glow)\"/><circle cx=\"-20\" cy=\"-10\" r=\"5\" fill=\"#FDE68A\" opacity=\".8\"/><circle cx=\"22\" cy=\"-8\" r=\"6\" fill=\"#FDE68A\" opacity=\".8\"/></g>" +
        "<ellipse cx=\"100\" cy=\"240\" rx=\"30\" ry=\"8\" fill=\"url(#waterG)\" opacity=\".6\"/><ellipse cx=\"300\" cy=\"245\" rx=\"28\" ry=\"7\" fill=\"url(#waterG)\" opacity=\".6\"/>" +
        "<text x=\"200\" y=\"22\" text-anchor=\"middle\" font-size=\"12\" fill=\"#FDE68A\" font-family=\"system-ui,sans-serif\" font-weight=\"600\">Thingyan · Thadingyut · Tazaungdaing</text>" +
        "<text x=\"200\" y=\"288\" text-anchor=\"middle\" font-size=\"10\" fill=\"#94A3B8\" font-family=\"system-ui,sans-serif\">Water festival · lights · hot-air balloons</text>";
    }
  };

  w.MMArt = {
    render: function (chapterId) {
      var fn = SCENES[chapterId];
      if (!fn) {
        return "<svg class=\"scene-hero-svg\" viewBox=\"0 0 400 300\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"400\" height=\"300\" fill=\"#F8FAFC\"/><text x=\"200\" y=\"150\" text-anchor=\"middle\" fill=\"#64748B\" font-family=\"system-ui,sans-serif\">Myanmar</text></svg>";
      }
      return "<svg class=\"scene-hero-svg\" viewBox=\"0 0 400 300\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\">" + fn() + "</svg>";
    }
  };
})(window);
