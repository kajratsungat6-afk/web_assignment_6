const ROOMS = [
  { id: "balcony", name: "Balcony", floor: 2, guests: [
    { name: "Aigerim", color: "green", time: "20:45", aitu: true, things: ["cup", "crumbs"] },
    { name: "Aliya", color: "black", time: "21:15", aitu: false, things: ["phone", "cup"] },
    { name: "Madina", color: "green", time: "22:10", aitu: false, things: ["phone", "bag", "crumbs"] },
    { name: "Ivan", color: "black", time: "20:10", aitu: true, things: ["cup"] }
  ] },
  { id: "hall", name: "Hall", floor: 2, guests: [
    { name: "Arman", color: "yellow", time: "20:35", aitu: false, things: ["bag", "glasses"] },
    { name: "Sophia", color: "purple", time: "21:20", aitu: true, things: ["phone"] },
    { name: "Dias", color: "green", time: "19:45", aitu: true, things: [] },
    { name: "Bekzat", color: "purple", time: "20:55", aitu: false, things: ["bag", "cup", "crumbs"] },
    { name: "Aruzhan", color: "black", time: "21:50", aitu: true, things: ["phone"] },
    { name: "Saule", color: "green", time: "21:25", aitu: false, things: ["glasses"] }
  ] },
  { id: "kitchen", name: "Kitchen", floor: 1, guests: [
    { name: "Nurlan", color: "red", time: "19:40", aitu: true, things: ["phone", "cup"] },
    { name: "Emma", color: "black", time: "20:15", aitu: false, things: ["bag"] },
    { name: "Timur", color: "green", time: "21:05", aitu: true, things: ["phone", "bag", "crumbs"] },
    { name: "Sergey", color: "yellow", time: "20:50", aitu: false, things: [] },
    { name: "Yerlan", color: "red", time: "21:40", aitu: true, things: ["glasses", "phone"] },
    { name: "Kamila", color: "green", time: "20:05", aitu: false, things: ["cup"] }
  ] },
  { id: "living", name: "Living room", floor: 1, guests: [
    { name: "Daniel", color: "blue", time: "19:55", aitu: false, things: ["glasses"] },
    { name: "Zarina", color: "green", time: "21:10", aitu: false, things: ["bag", "phone", "crumbs"] },
    { name: "Natasha", color: "yellow", time: "20:30", aitu: true, things: [] },
    { name: "Askar", color: "black", time: "21:00", aitu: true, things: ["phone"] },
    { name: "Inkar", color: "purple", time: "20:20", aitu: false, things: ["bag"] }
  ] }
];

const MIRAS = { name: "Miras", color: "blue", time: "21:20", aitu: true, things: ["phone"] };

const ICONS = { phone: "📱", glasses: "👓", bag: "👜", cup: "☕", crumbs: "🍰" };

const hooks = { before: null, roomHead: null, afterCase: null };

function avatarUrl(name) {
  return "https://api.dicebear.com/9.x/open-peeps/svg?seed=" + name;
}

function makeCard(g) {
  const $card = $("<div>")
    .addClass("card guest color-" + g.color)
    .attr({
      tabindex: 0,
      "data-name": g.name,
      "data-time": g.time,
      "data-aitu": g.aitu ? "yes" : "no"
    });
  if (g.aitu) {
    $card.addClass("aitu");
  }
  $.each(g.things, function (i, thing) {
    $card.addClass("has-" + thing);
  });

  const $wrap = $("<div>").addClass("avatar-wrap");
  $("<img>").addClass("avatar").attr({ src: avatarUrl(g.name), alt: g.name }).appendTo($wrap);
  if (g.aitu) {
    $("<span>").addClass("badge").attr("title", "AITU student").text("🎓").appendTo($wrap);
  }

  const $things = $("<div>").addClass("things");
  $.each(g.things, function (i, thing) {
    $("<span>").addClass("icon").attr("title", thing).text(ICONS[thing]).appendTo($things);
  });

  return $card.append(
    $wrap,
    $("<div>").addClass("gname").text(g.name),
    $("<div>").addClass("gtime").text("⏲ " + g.time),
    $things
  );
}

function buildParty() {
  if (hooks.before) {
    hooks.before();
  }
  const $house = $("#house").empty();
  $.each([2, 1], function (i, floor) {
    const $floor = $("<div>").addClass("floor");
    $floor.append($("<div>").addClass("floor-label").text("FLOOR " + floor));
    const $rooms = $("<div>").addClass("rooms");
    $.each(ROOMS, function (j, room) {
      if (room.floor !== floor) {
        return;
      }
      const $room = $("<section>")
        .addClass("room")
        .attr({ id: "room-" + room.id, "data-name": room.name, "data-floor": room.floor });
      const $head = $("<div>").addClass("room-head").append($("<h3>").text(room.name));
      if (hooks.roomHead) {
        hooks.roomHead(room, $head);
      }
      const $guests = $("<div>").addClass("guests").attr("id", "guests-" + room.id);
      $.each(room.guests, function (k, g) {
        $guests.append(makeCard(g));
      });
      $room.append($head, $guests);
      $rooms.append($room);
    });
    $floor.append($rooms);
    $house.append($floor);
  });
}

const CASES = [
  { id: 1, text: "Who is in the hall?", run: function () {
    return $(".room[data-name='Hall'] .guest");
  } },
  { id: 2, text: "Who is dressed in yellow or purple?", run: function () {
    return $(".guest.color-yellow, .guest.color-purple");
  } },
  { id: 3, text: "Which AITU students are upstairs?", run: function () {
    return $(".room[data-floor='2'] .guest.aitu");
  } },
  { id: 4, text: "Who has glasses or a bag?", run: function () {
    return $(".guest.has-glasses, .guest.has-bag");
  } },
  { id: 5, text: "Who came with nothing at all?", run: function () {
    return $(".guest:not(:has(.icon))");
  } },
  { id: 6, text: "Who has a phone but no bag?", run: function () {
    return $(".guest.has-phone:not(.has-bag)");
  } },
  { id: 7, text: "Who arrived between 20:30 and 21:00?", run: function () {
    return $(".guest").filter(function () {
      const t = $(this).attr("data-time");
      return t >= "20:30" && t <= "21:00";
    });
  } },
  { id: 8, text: "Who arrived after 21:00 and is not an AITU student?", run: function () {
    return $(".guest:not(.aitu)").filter(function () {
      return $(this).attr("data-time") > "21:00";
    });
  } },
  { id: 9, text: "Who stands right next to Askar?", run: function () {
    return $(".guest[data-name='Askar']").prev().add($(".guest[data-name='Askar']").next());
  } },
  { id: 10, text: "Who stands last in each room?", run: function () {
    return $(".guest:last-child");
  } },
  { id: 11, text: "Who stands third in each room?", run: function () {
    return $(".guest:nth-child(3)");
  } },
  { id: 12, text: "Who stands after Timur in his room?", run: function () {
    return $(".guest[data-name='Timur']").nextAll(".guest");
  } },
  { id: 13, text: "Who stands right before someone in black?", run: function () {
    return $(".guest.color-black").prev(".guest");
  } },
  { id: 14, text: "In which room is Aruzhan?", run: function () {
    return $(".guest[data-name='Aruzhan']").closest(".room");
  } },
  { id: 15, text: "Which rooms have fewer than 6 guests?", run: function () {
    return $(".room").filter(function () {
      return $(this).find(".guest").length < 6;
    });
  } },
  { id: 16, text: "Which rooms have a cup but no glasses?", run: function () {
    return $(".room:has(.has-cup):not(:has(.has-glasses))");
  } },
  { id: 17, text: "Who came first to each room?", run: function () {
    return $(".guest").filter(function () {
      const t = $(this).attr("data-time");
      return $(this).siblings(".guest").filter(function () {
        return $(this).attr("data-time") < t;
      }).length === 0;
    });
  } },
  { id: 18, text: "Miras joins Askar and Inkar", noJump: true, run: function () {
    return makeCard(MIRAS).hide().insertAfter(".guest[data-name='Askar']").fadeIn(800);
  } },
  { id: 19, text: "Natasha goes home", noJump: true, run: function () {
    return $(".guest[data-name='Natasha']").fadeOut(800, function () {
      $(this).remove();
    });
  } },
  { id: 20, text: "Who took the cake?", run: function () {
    return $(".room[data-floor='1'] .guest.has-crumbs:not(.has-cup)")
      .filter(function () {
        const t = $(this).attr("data-time");
        return t > "21:00" && t < "21:30";
      })
      .filter(function () {
        return $(this).prev(".aitu").length + $(this).next(".aitu").length > 0;
      });
  } }
];

function buildCaseButtons(selector) {
  const $box = $(selector).empty();
  $.each(CASES, function (i, c) {
    $("<button>")
      .attr({ type: "button", "data-case": c.id })
      .addClass("btn case-btn")
      .text(c.id + ". " + c.text)
      .appendTo($box);
  });
}

function jump($els) {
  $els.animate({ top: -14 }, {
    duration: 150,
    queue: false,
    complete: function () {
      $(this).animate({ top: 0 }, { duration: 150, queue: false });
    }
  });
}

function showResult($found) {
  const names = $found.map(function () {
    return $(this).attr("data-name");
  }).get();
  let text = "Found: " + names.length;
  if (names.length > 0) {
    text += " — " + names.join(", ");
  }
  $("#result").text(text);
}

function runCase(c) {
  buildParty();              
  const $found = c.run();    
  $found.addClass("found");  
  if (!c.noJump) {
    jump($found);
  }
  showResult($found);
  if (hooks.afterCase) {
    hooks.afterCase($found);
  }
  return $found;
}
