var rangeSlider = function () {
  var slider = $(".range-slider"),
    range = $(".range-slider-range"),
    value = $(".range-slider-value");

  slider.each(function () {
    value.each(function () {
      var value = $(this).prev().attr("value");
      $(this).html(value);
    });

    range.on("input", function () {
      $(this).next(value).html(this.value);
    });
  });
};

rangeSlider();
