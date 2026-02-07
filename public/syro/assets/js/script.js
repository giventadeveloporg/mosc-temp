
//#########################################################################################################

// Scroll to a Specific Div
if ($(".scroll-to-target").length) {
  $(".scroll-to-target").on("click", function () {
    var target = $(this).attr("data-target");
    // animate
    $("html, body").animate(
      {
        scrollTop: $(target).offset().top,
      },
      1000
    );
  });
}

//#########################################################################################################

//Sticky Navbar
window.onscroll = function () {
  myFunction();
};

var navbar = document.getElementById("navbar");
var sticky = navbar.offsetTop;

function myFunction() {
  if (window.pageYOffset > sticky) {
    navbar.classList.add("sticky");
  } else {
    navbar.classList.remove("sticky");
  }
}

//preloader

$(window).on("load", function () {
  // $("#loading").hide();
});

//#########################################################################################################

//tooltip

$(document).ready(function () {
  $('[data-bs-toggle="tooltip"]').tooltip();
});

//#########################################################################################################

//Search box-focus

$("#search-btn").click(function () {
  // $("#search-input").focus();
  $("#search-item").on("shown.bs.modal", function () {
    $(this).find("#search-input").focus();
  });
});

