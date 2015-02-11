
;(function($, window, document) {
  $(function() {

    var events = [
      {start: 30, end: 150},
      {start: 540, end: 600},
      {start: 560, end: 620},
      {start: 610, end: 670}
    ];

    layOutDay(events);
 });
}(window.jQuery, window, document));

function layOutDay(events) {
  var EVENT_TMPL, sortedEvents, $eventContainer;

  EVENT_TMPL = [
    '<div class="event-view">',
      '<div class="event-header">',
        '<h3 class="event-title">Sample Item</h3>',
        '<span class="event-location">Sample Location</span>',
      '</div>',
      // '<div class="event-detail">',
      // '</div>',
    '</div>'
  ].join("\n");

  $eventContainer = $('.event-container');

  // Sort events by start, then end in ascending order.
  // If start start is same, then event with
  // longer duration goes up.
  sortedEvents = events.sort(function(a, b) {
    if (a.start < b.start) {
      return -1;
    }
    if (a.start > b.start) {
      return 1;
    }

    if (a.end > b.end) {
      return -1;
    } else {
      return 1;
    }
  });

  // Clear previously drawn events before rendering new set
  $eventContainer.html('');

  render(detectOverlaps(sortedEvents));

  /**
   * Update each event with col, and columns
   * to calculate left and with later.
   * Modifies original array
   */
  function pack(columns) {
    var i, j, eventsInColumn, ev, eventCount;
    var columnCount = columns.length;

    columns.map(function(eventsInColumn, i) {
      return eventsInColumn.map(function(ev, j) {
        ev.col = i;
        ev.columns = columnCount;
        return ev;
      });
    });

    return columns;
  }

  function detectOverlaps(events) {
    var i, j, ev, processed, last, col;
    var columns = [];
    var lastEventEnd = null;
    var organizedColumns = [];

    for (i = 0; i < events.length; i++) {
      ev = events[i];
      processed = false;

      // Block has no more overlap. Wrap up and move on to next events
      if (lastEventEnd !== null && ev.start >= lastEventEnd) {
        console.log(lastEventEnd, ev);
        organizedColumns.push.apply(organizedColumns, pack(columns));
        columns = [];
        lastEventEnd = null;
      }

      for (j = 0; j < columns.length; j++) {
        col = columns[j];
        last = col[col.length - 1];
        if (last.end <= ev.start || last.start >= ev.end) {
          col.push(ev);
          processed = true;
          break;
        }
      }

      if (!processed) {
        columns.push([ev]);
      }

      if (lastEventEnd === null || ev.end > lastEventEnd) {
        lastEventEnd = ev.end
      }

      if (columns.length > 0) {
        pack(columns);
      }
    }

    if (columns.length > 0) {
      organizedColumns.push.apply(organizedColumns, columns);
    }

    // console.log(organizedColumns);
    return organizedColumns;
  }

  function render(columns) {
    var i, j, el, evCount, ev, heightPercentage, topPercentage;
    var colCount = columns.length;

    for (i = 0; i < colCount; i++) {
      eventsInColumn = columns[i];
      evCount = eventsInColumn.length;

      for (j = 0; j < evCount; j++) {
        ev = eventsInColumn[j];
        heightPercentage = (ev.end - ev.start) / 12 / 60 * 100 + '%';
        topPercentage = ev.start / 12 / 60 * 100  + '%';

        $event = $(EVENT_TMPL).css({
          position: 'absolute',
          top: topPercentage,
          left: (ev.col / ev.columns * 100) + '%',
          width: (100 / ev.columns) + '%',
          height: heightPercentage
        });
        // $event.find('.event-detail').append([
        //   '<div>' + topPercentage + '</div>',
        //   '<div>' + heightPercentage + '</div>',
        //   '<div>' + ev.columns + '</div>'
        // ].join(''));
        $eventContainer.append($event);
      }
    }
  }
}