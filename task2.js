$(function () {
  const CARD_W = 76;    
  const CARD_M = 4;      
  const PALE = 0.2;      
  const FADE_MS = 300;
  const MOVE_MS = 800;
  const SORT_MS = 700;
  const DETAIL_W = 300;

  const $detail = $("#detail");
  let openName = null;   
  let seq = 0;           
  let sorted = {};       

  const COLOR_WORDS = { red: "red", blue: "blue", green: "green", black: "black", yellow: "yellow", purple: "purple" };
  const THING_WORDS = { phone: "a phone", glasses: "glasses", bag: "a bag", cup: "a cup", crumbs: "cake crumbs" };

  function findGuest(name) {
    let result = null;
    $.each(ROOMS, function (i, room) {
      $.each(room.guests, function (j, g) {
        if (g.name === name) {
          result = { room: room, guest: g, index: j };
        }
      });
    });
    return result;
  }

  function roomById(id) {
    let result = null;
    $.each(ROOMS, function (i, room) {
      if (room.id === id) {
        result = room;
      }
    });
    return result;
  }

  function settleAll() {
    $(".card, .flyer").stop(true, true);
  }

  hooks.afterCase = function ($found) {
    const $bright = $found.is(".room") ? $found.find(".guest") : $found;
    $(".guest").not($bright).fadeTo(FADE_MS, PALE);
    $bright.fadeTo(FADE_MS, 1);
  };

  $("#clear").on("click", function () {
    settleAll();
    $(".guest").fadeTo(FADE_MS, 1);
    $(".found").removeClass("found");
    $(".case-btn").removeClass("active");
    $("#result").text("");
  });

  function thingsText(things) {
    if (things.length === 0) {
      return "Has nothing with them";
    }
    const words = $.map(things, function (t) {
      return THING_WORDS[t];
    });
    if (words.length === 1) {
      return "Has " + words[0];
    }
    return "Has " + words.slice(0, -1).join(", ") + " and " + words[words.length - 1];
  }

  function fillDetail(g, room) {
    $detail.empty();
    const $body = $("<div>").addClass("detail-body color-" + g.color);
    $body.append($("<img>").addClass("avatar").attr({ src: avatarUrl(g.name), alt: g.name }));
    $body.append($("<h2>").text(g.name));
    const lines = [
      "Came at " + g.time,
      g.aitu ? "AITU student" : "Not an AITU student",
      thingsText(g.things),
      "Wears " + COLOR_WORDS[g.color] + " clothes",
      "Is in the " + room.name.toLowerCase()
    ];
    const $list = $("<ul>");
    $.each(lines, function (i, line) {
      $list.append($("<li>").text(line));
    });
    $body.append($list);
    // a button for every other room
    $.each(ROOMS, function (i, r) {
      if (r.id !== room.id) {
        $body.append(
          $("<button>").attr({ type: "button", "data-room": r.id })
            .addClass("btn move-btn").text("Move to the " + r.name.toLowerCase())
        );
      }
    });
    $detail.append($body);
  }

  function shrinkToGuest(name, ms, done) {
    const $av = $(".guest[data-name='" + name + "'] .avatar");
    if ($av.length > 0) {
      const off = $av.offset();
      $detail.stop(true).animate(
        { left: off.left, top: off.top, width: $av.outerWidth(), height: $av.outerWidth(), opacity: 0.3 },
        ms, done
      );
    } else {
      $detail.stop(true).fadeOut(ms, done);
    }
  }

  function showCard($g) {
    const name = $g.attr("data-name");
    const found = findGuest(name);
    openName = name;
    fillDetail(found.guest, found.room);

    $detail.stop(true).css({ display: "block", visibility: "hidden", width: DETAIL_W, height: "auto", opacity: 1, left: 0, top: 0 });
    const fullH = $detail.outerHeight();

    const $av = $g.find(".avatar");
    const off = $av.offset();
    const $win = $(window);
    const left = $win.scrollLeft() + Math.max(10, ($win.width() - DETAIL_W) / 2);
    const top = $win.scrollTop() + Math.max(10, ($win.height() - fullH) / 2);
    $detail
      .css({ visibility: "visible", left: off.left, top: off.top, width: $av.outerWidth(), height: $av.outerWidth(), opacity: 0.3 })
      .animate({ left: left, top: top, width: DETAIL_W, height: fullH, opacity: 1 }, 350);
  }

  function closeCard() {
    if (openName === null) {
      return;
    }
    const name = openName;
    openName = null;
    const my = ++seq;
    shrinkToGuest(name, 250, function () {
      if (my === seq) {
        $detail.hide();
      }
    });
  }

  function hideCardNow() {
    seq++;
    openName = null;
    $detail.stop(true).hide();
  }

  function openFor($g) {
    const name = $g.attr("data-name");
    if (name === openName) {
      closeCard();
      return;
    }
    if (openName === null) {
      showCard($g);
      return;
    }
    const old = openName;
    openName = name;
    const my = ++seq;
    shrinkToGuest(old, 200, function () {
      if (my === seq) {
        showCard($g);
      }
    });
  }

  $("#house").on("click", ".guest", function () {
    openFor($(this));
  });
  $("#house").on("keydown", ".guest", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFor($(this));
    }
  });
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      closeCard();
    }
  });
  $(document).on("click", function (e) {
    const $t = $(e.target);
    if (openName !== null && $t.closest("#detail").length === 0 && $t.closest(".guest").length === 0) {
      closeCard();
    }
  });

  function moveGuest(name, toId) {
    settleAll();
    const info = findGuest(name);
    const toRoom = roomById(toId);
    const $old = $(".guest[data-name='" + name + "']");
    if (!info || !toRoom || info.room === toRoom || $old.length === 0) {
      return;
    }

    info.room.guests.splice(info.index, 1);
    toRoom.guests.push(info.guest);

    const from = $old.offset();
    const opacity = $old.css("opacity");
    const $fly = $old.clone().removeClass("guest found").addClass("flyer")
      .removeAttr("tabindex")
      .css({ left: from.left, top: from.top, width: $old.outerWidth(), margin: 0 });
    $("body").append($fly);

    const $new = $old.clone().removeClass("found").attr("style", "")
      .css({ opacity: opacity, width: 0, marginLeft: 0, marginRight: 0, visibility: "hidden" });
    $("#guests-" + toId).append($new);
    $new.css({ width: CARD_W, marginLeft: CARD_M, marginRight: CARD_M });
    const target = $new.offset();                 // where the card will stand
    $new.css({ width: 0, marginLeft: 0, marginRight: 0 });

    $old.removeClass("guest found").addClass("leaving").css("visibility", "hidden")
      .animate({ width: 0, marginLeft: 0, marginRight: 0 }, MOVE_MS, function () {
        $(this).remove();
      });
    $new.animate({ width: CARD_W, marginLeft: CARD_M, marginRight: CARD_M }, MOVE_MS);
    $fly.animate({ left: target.left, top: target.top }, MOVE_MS, function () {
      $new.css("visibility", "visible");
      $fly.remove();
    });
  }

  $detail.on("click", ".move-btn", function () {
    const name = openName;
    const toId = $(this).attr("data-room");
    hideCardNow();
    moveGuest(name, toId);
  });

  function sortRoom(roomId) {
    settleAll();
    const $box = $("#guests-" + roomId);
    const $cards = $box.children(".guest");

    const before = {};
    $cards.each(function () {
      before[$(this).attr("data-name")] = $(this).offset();
    });

    sorted[roomId] = !sorted[roomId];
    if (sorted[roomId]) {
      const list = $cards.get().sort(function (a, b) {
        const ta = $(a).attr("data-time");
        const tb = $(b).attr("data-time");
        return ta < tb ? -1 : (ta > tb ? 1 : 0);
      });
      $.each(list, function (i, el) {
        $box.append(el);
      });
    } else {
      $.each(roomById(roomId).guests, function (i, g) {
        $box.append($box.children(".guest[data-name='" + g.name + "']"));
      });
    }

    $cards.each(function () {
      const $c = $(this);
      const was = before[$c.attr("data-name")];
      const now = $c.offset();
      $c.css({ left: was.left - now.left, top: was.top - now.top }).animate({ left: 0, top: 0 }, SORT_MS);
    });
    $("#room-" + roomId + " .sort-btn").toggleClass("active", sorted[roomId]);
  }

  $("#house").on("click", ".sort-btn", function () {
    sortRoom($(this).attr("data-room"));
  });

  hooks.before = function () {
    hideCardNow();
    $(".flyer").stop(true).remove();
    sorted = {};
  };
  hooks.roomHead = function (room, $head) {
    $head.append($("<button>").attr({ type: "button", "data-room": room.id }).addClass("btn sort-btn").text("Sort by time"));
  };

  buildParty();
  buildCaseButtons("#cases");
  $("#cases").on("click", ".case-btn", function () {
    const id = Number($(this).attr("data-case"));
    $(".case-btn").removeClass("active");
    $(this).addClass("active");
    runCase(CASES[id - 1]);
  });
});
