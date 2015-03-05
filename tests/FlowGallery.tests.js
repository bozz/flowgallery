describe("FlowGallery", function() {

  describe("basic setup with default config", function() {
    var $gallery, $el, api, clock,
        fullImageHeight = 400,
        fullImageWidth = 250;

    beforeEach(function() {
      clock = sinon.useFakeTimers();

      loadFixtures('basic_gallery.html');

      $el = $('#jasmine-fixtures');
      $gallery = $('#gallery');
      SpecHelper.loadFakeImages($gallery, fullImageWidth, fullImageHeight);
      api = $gallery.flowGallery();
    });

    afterEach(function() {
      clock.restore();
    });

    describe('gallery list', function() {
      it('should be visible', function() {
        expect( $gallery.css('visibility') ).toEqual('visible');
      });

      it('should have 6 images', function() {
        expect( $gallery.find('img').length ).toEqual(6);
      });

      it('should set non-active images to thumbnail size', function() {
        var $images = $gallery.find('li').not('.active');
        var expectedHeight = Math.round(fullImageHeight * 100 / fullImageWidth);
        $images.each(function(index) {
          expect( $(this).width() ).toEqual(100); // set loadingWidth since both thumbHeight and thumbWidth set to 'auto'
          expect( $(this).height() ).toEqual(expectedHeight);
        });
      });

      it('should be as wide as outer container', function() {
        var outerContainer = $gallery.parent().parent();
        expect( $gallery.width() ).toEqual(outerContainer.width());
      });
    });

    describe("active image", function() {
      var $active;

      beforeEach(function() {
        $active = $gallery.find('li').first();
      });

      it("should be first item in list", function() {
        expect( $active.hasClass('active') ).toEqual(true);
      });

      it("should be set to full size", function() {
        expect( $active.width() ).toEqual(fullImageWidth);
        expect( $active.height() ).toEqual(fullImageHeight);
      });
    });

    describe('wrapper', function() {
      var $wrapper;

      beforeEach(function() {
        $wrapper = $('.bf-wrapper', $el);
      });

      it("should wrap around gallery", function() {
        expect( $wrapper.children('ul#gallery').length ).toEqual(1);
      });

      it("should have position:relative", function() {
        expect( $wrapper.css('position') ).toEqual('relative');
      });
    });

    describe('caption', function() {
      var $caption;

      beforeEach(function() {
        $caption = $('.bf-caption', $el);
      });

      it('should exist', function() {
        expect( $caption.length ).toEqual(1);
      });
    });

    describe('events', function() {
      describe('mouse', function() {
        it('when first item active, should leave first item as active when first item clicked', function() {
          // this is enabled by "forwardOnActiveClick" default config
          $firstItem = $gallery.find('li').first();
          $secondItem = $gallery.find('li').eq(1);
          expect( $firstItem.hasClass('active') ).toEqual(true);
          $firstItem.click();
          expect( $firstItem.hasClass('active') ).toEqual(true);
        });

        it('when first item active, should set second item as active when second item clicked', function() {
          $secondItem = $gallery.find('li').eq(1);
          expect( $secondItem.hasClass('active') ).toEqual(false);
          $secondItem.click();
          expect( $secondItem.hasClass('active') ).toEqual(true);
        });

        it('when second item active, should set first item as active when first item clicked', function() {
          api.jump(1);
          $firstItem = $gallery.find('li').first();
          $secondItem = $gallery.find('li').eq(1);
          expect( $secondItem.hasClass('active') ).toEqual(true);
          $firstItem.click();
          expect( $firstItem.hasClass('active') ).toEqual(true);
          expect( $secondItem.hasClass('active') ).toEqual(false);
        });
      });

      describe('keyboard', function() {
        var leftKeyDown, rightKeyDown;

        beforeEach(function() {
          leftKeyDown = jQuery.Event('keydown');
          leftKeyDown.keyCode = leftKeyDown.which = 39;

          rightKeyDown = jQuery.Event('keydown');
          rightKeyDown.keyCode = rightKeyDown.which = 37;
        });

        it('when first item active, should set second item as active when left arrow key pressed', function() {
          $secondItem = $gallery.find('li').eq(1);
          expect( $secondItem.hasClass('active') ).toEqual(false);
          $el.trigger(leftKeyDown);
          expect( $secondItem.hasClass('active') ).toEqual(true);
        });

        it('when first item active, should keep first item as active when right arrow key pressed', function() {
          $firstItem = $gallery.find('li').first();
          expect( $firstItem.hasClass('active') ).toEqual(true);
          $el.trigger(rightKeyDown);
          expect( $firstItem.hasClass('active') ).toEqual(true);
        });

        it('when second item active, should set first item as active when right arrow key pressed', function() {
          api.jump(1);
          $firstItem = $gallery.find('li').first();
          $secondItem = $gallery.find('li').eq(1);

          expect( $secondItem.hasClass('active') ).toEqual(true);
          $el.trigger(rightKeyDown);
          expect( $firstItem.hasClass('active') ).toEqual(true);
          expect( $secondItem.hasClass('active') ).toEqual(false);
        });

        it('when last item active, should keep last item as active when left arrow key pressed', function() {
          api.jump(5);
          $lastItem = $gallery.find('li').last();

          expect( $lastItem.hasClass('active') ).toEqual(true);
          $el.trigger(leftKeyDown);
          expect( $lastItem.hasClass('active') ).toEqual(true);
        });
      });
    });

    describe('scripting api', function() {

      describe('getLength', function() {
        it('should return correct length', function() {
          expect( api.getLength() ).toEqual(6);
        });
      });

      describe('getOptions', function() {
        it('should return config options', function() {
          expect( api.getOptions() ).toEqual($.fn.flowGallery.defaults);
        });
      });

      describe('jump', function() {
        it('when first item active, should set last item as active if correct index specified', function() {
          $lastItem = $gallery.find('li').last();

          expect( $lastItem.hasClass('active') ).toEqual(false);
          api.jump(5);
          expect( $lastItem.hasClass('active') ).toEqual(true);
        });

        it('when first item active, should keep first item active if invalid index specified', function() {
          $firstItem = $gallery.find('li').first();
          expect( $firstItem.hasClass('active') ).toEqual(true);
          api.jump(500);
          expect( $firstItem.hasClass('active') ).toEqual(true);
        });
      });

      describe('next', function() {
        it('when first item active, should move to second item', function() {
          $secondItem = $gallery.find('li').eq(1);
          expect( $secondItem.hasClass('active') ).toEqual(false);
          api.next();
          expect( $secondItem.hasClass('active') ).toEqual(true);
        });

        it('when last item active, should keep last item active', function() {
          api.jump(5);
          $lastItem = $gallery.find('li').last();

          expect( $lastItem.hasClass('active') ).toEqual(true);
          api.next();
          expect( $lastItem.hasClass('active') ).toEqual(true);
        });
      });

      describe('prev', function() {
        it('when second item active, should set first item active', function() {
          api.jump(1);
          $firstItem = $gallery.find('li').first();
          $secondItem = $gallery.find('li').eq(1);

          expect( $secondItem.hasClass('active') ).toEqual(true);
          api.prev();
          expect( $firstItem.hasClass('active') ).toEqual(true);
        });

        it('when first item active, should keep first item active', function() {
          $firstItem = $gallery.find('li').first();

          expect( $firstItem.hasClass('active') ).toEqual(true);
          api.prev();
          expect( $firstItem.hasClass('active') ).toEqual(true);
        });
      });
    });
  });

});
