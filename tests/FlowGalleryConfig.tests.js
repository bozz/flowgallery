describe("FlowGalleryConfig", function() {
  var $gallery, $el, api, clock,
      fullImageWidth = 250,
      fullImageHeight = 400;

  beforeEach(function() {
    clock = sinon.useFakeTimers();

    loadFixtures('basic_gallery.html');

    $el = $('#jasmine-fixtures');
    $gallery = $('#gallery');
    SpecHelper.loadFakeImages($gallery, fullImageWidth, fullImageHeight);
  });

  afterEach(function() {
    clock.restore();
  });

  describe('activeIndex', function() {
    it('should set image with specified index as initial active image', function() {
      $gallery.flowGallery({
        activeIndex: 2
      });
      expect( $gallery.find('li').eq(2).hasClass('active') ).toEqual(true);
    });
    xit('should set first image as active for invalid index', function() {
      $gallery.flowGallery({
        activeIndex: 99
      });
      expect( $gallery.find('li').first().hasClass('active') ).toEqual(true);
    });
  });

  describe('backgroundColor', function() {
    it('should set border and caption to specified color', function() {
      $gallery.flowGallery({
        backgroundColor: '#ff0000'
      });
      expect( $gallery.parent().find('.bf-caption').css('backgroundColor') ).toEqual('rgb(255, 0, 0)');
      expect( $gallery.find('li').css('backgroundColor') ).toEqual('rgb(255, 0, 0)');
    });
  });

  describe('forceHeight', function() {
    it('should set all full size images to specified height', function() {
      $gallery.flowGallery({
        forceHeight: 200
      });
      expect( $gallery.find('li img').first().height() ).toEqual(200);
    });
  });

  describe('forceWidth', function() {
    it('should set all full size images to specified width', function() {
      $gallery.flowGallery({
        forceWidth: 200
      });
      expect( $gallery.find('li img').first().width() ).toEqual(200);
    });
  });

  describe('imagePadding', function() {
    it('should set border around images to specified value', function() {
      var targetPadding = 8;
      $gallery.flowGallery({
        imagePadding: targetPadding
      });
      expect( $gallery.find('li').first().css('padding') ).toEqual(targetPadding + 'px');
      // add 10px for extra padding on caption
      expect( $gallery.parent().find('p.bf-caption').css('padding-left') ).toEqual((targetPadding + 10) + 'px');
    });
  });

  describe('thumbHeight', function() {
    var targetHeight = 40;
    beforeEach(function() {
      $gallery.flowGallery({
        thumbHeight: targetHeight 
      });
    });
    it('should set all thumb images to specified height', function() {
      expect( $gallery.find('li img').eq(2).height() ).toEqual(targetHeight);
    });
    it('should set width to keep aspect ratio', function() {
      var expectedWidth = Math.round(fullImageWidth * targetHeight / fullImageHeight);
      expect( $gallery.find('li img').eq(2).width() ).toEqual(expectedWidth);
    });
  });

  describe('thumbWidth', function() {
    var targetWidth = 40;
    beforeEach(function() {
      $gallery.flowGallery({
        thumbWidth: targetWidth
      });
    });
    it('should set all thumb images to specified width', function() {
      expect( $gallery.find('li img').eq(2).width() ).toEqual(targetWidth);
    });
    it('should set height to keep aspect ratio', function() {
      var expectedHeight = Math.round(fullImageHeight * targetWidth / fullImageWidth);
      expect( $gallery.find('li img').eq(2).height() ).toEqual(expectedHeight);
    });
  });

  describe('thumbPadding', function() {
    it('should set padding on all thumb images to specified value', function() {
      var targetPadding = 5;
      $gallery.flowGallery({
        thumbPadding: targetPadding
      });
      expect( $gallery.find('li').eq(2).css('paddingLeft') ).toEqual(targetPadding + 'px');
    });
  });
});
