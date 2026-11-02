$(function () {
  buildParty();
  buildCaseButtons("#cases");

  $("#cases").on("click", ".case-btn", function () {
    const id = Number($(this).attr("data-case"));
    $(".case-btn").removeClass("active");
    $(this).addClass("active");
    runCase(CASES[id - 1]);
  });
});
