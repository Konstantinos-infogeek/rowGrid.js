(function($){
  $.fn.rowGrid = function( options ) {
    if ( this.length == 0 ) {
      console.error( 'No element found for "' + this.selector + '".' );
      return this;
    }
    if ( this.length > 1 ) {
      return this.each(
        function() {
          $(this).rowGrid( options );
        }
      );
    }

    if(options === 'appended') {
      options = this.data('grid-options');
      var $lastRow = this.children('.' + options.lastRowClass);
      var items = $lastRow.nextAll().add($lastRow);
      layout(this, options, items);
    } else {
      options = $.extend( {}, $.fn.rowGrid.defaults, options );
      var $container = this;
      $container.data('grid-options', options);
      layout($container, options);
      
      if(options.resize) {
        $(window).on('resize', {container: $container}, function(event) {
          layout(event.data.container, options);
        });
      }
    }
    return this;
  };
  
  $.fn.rowGrid.defaults = {
    minMargin: null,
    maxMargin: null,
    resize: true,
    lastRowClass: 'last-row',
    firstItemClass: null
  };
 
  function layout($container, options, items) {
    var rowWidth = 0,
        rowElems = [],
        items = items || $container.children(options.itemSelector),
        itemsSize = items.length;

    $container.children('.' + options.lastRowClass).removeClass(options.lastRowClass);

    for(var index = 0; index < itemsSize; ++index) {
      items[index].removeAttribute('style');
      if (items[index].classList) {
        items[index].classList.remove(options.firstItemClass);
      }
      else {
        // IE <10
        items[index].className = items[index].className.replace(new RegExp('(^|\\b)' + options.firstItemClass + '(\\b|$)', 'gi'), ' ');
      }
    }

    // read
    var containerWidth = $container[0].clientWidth;
    var itemAttrs = [];
    for(var i = 0; i < itemsSize; ++i) {
      itemAttrs[i] = {
        outerWidth: items[i].offsetWidth,
        height: items[i].offsetHeight
      };
    }

    // write
    for(var index = 0; index < itemsSize; ++index) {
      rowWidth += itemAttrs[index].outerWidth;
      rowElems.push(items[index]);
      
      // check if it is the last element
      if(index === itemsSize - 1) {
        for(var rowElemIndex = 0; rowElemIndex<rowElems.length; rowElemIndex++) {
          // if first element in row 
          if(rowElemIndex === 0) {
            rowElems[rowElemIndex].className += ' ' + options.lastRowClass;
          }
          rowElems[rowElemIndex].style['margin-right'] = (rowElemIndex < rowElems.length - 1)?options.minMargin : 0;
        }
      }      
      
      // check whether width of row is too high
      if(rowWidth + options.maxMargin * (rowElems.length - 1) > containerWidth) {
        var diff = rowWidth + options.maxMargin * (rowElems.length - 1) - containerWidth;
        var nrOfElems = rowElems.length;
        // change margin
        var maxSave = (options.maxMargin - options.minMargin) * (nrOfElems - 1);
        if(maxSave < diff) {
          var rowMargin = options.minMargin;
          diff -= (options.maxMargin - options.minMargin) * (nrOfElems - 1);
        } else {
          var rowMargin = options.maxMargin - diff / (nrOfElems - 1);
          diff = 0;
        }
        var rowElem,
          widthDiff = 0;
        for(var rowElemIndex = 0; rowElemIndex<rowElems.length; rowElemIndex++) {
          rowElem = rowElems[rowElemIndex];
          var rowElemWidth = itemAttrs[index+parseInt(rowElemIndex)-rowElems.length+1].outerWidth;
          var newWidth = rowElemWidth - (rowElemWidth / rowWidth) * diff;
          var newHeight = Math.round(itemAttrs[index+parseInt(rowElemIndex)-rowElems.length+1].height * (newWidth / rowElemWidth));
          if (widthDiff + 1 - newWidth % 1 >= 0.5 ) {
            widthDiff -= newWidth % 1;
            newWidth = Math.floor(newWidth);
          } else {
            widthDiff += 1 - newWidth % 1;
            newWidth = Math.ceil(newWidth);
          }
          rowElem.style.cssText =
              'width: ' + newWidth + 'px;' +
              'height: ' + newHeight + 'px;' +
              'margin-right: ' + ((rowElemIndex < rowElems.length - 1)?rowMargin : 0) + 'px';
          if(rowElemIndex === 0) {
            rowElem.className += ' ' + options.firstItemClass;
          }
        }
        rowElems = [],
          rowWidth = 0;
      }
    }
  }
})(jQuery);