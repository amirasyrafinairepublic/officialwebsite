/* ==========================================================================
   INAI REPUBLIC — Blog System Renderer (js/blog.js)
   Requires: js/blog-data.js (window.INAI_BLOG.posts — metadata only;
   article bodies are inlined statically inside blog/*.html)
   Renders:
     1. Homepage preview carousel (#blog-carousel-track) — keyboard accessible
     2. Blog index grid (#blog-grid) on blog.html
     3. Article prev/next navigation (#blog-article-nav) on blog/*.html
   ========================================================================== */

(function () {
  'use strict';

  var MONTHS_MS = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];
  var HOME_CAROUSEL_COUNT = 4;

  function getPosts() {
    var data = window.INAI_BLOG;
    return data && Array.isArray(data.posts) ? data.posts : [];
  }

  /* Root pages render "blog/x.html"; pages under /blog/ render "../blog/x.html" */
  function basePath() {
    var depth = document.body && document.body.getAttribute
      ? document.body.getAttribute('data-base')
      : '';
    return depth ? depth.replace(/\/?$/, '/') : '';
  }

  function esc(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    var parts = String(iso || '').split('-');
    if (parts.length !== 3) {
      return String(iso || '');
    }
    var day = parseInt(parts[2], 10);
    var month = MONTHS_MS[parseInt(parts[1], 10) - 1] || '';
    return day + ' ' + month + ' ' + parts[0];
  }

  function postHref(post) {
    return basePath() + post.url;
  }

  function cardMarkup(post) {
    return [
      '<article class="blog-card">',
        '<a class="blog-card-link" href="' + esc(postHref(post)) + '" aria-label="Baca artikel: ' + esc(post.title) + '">',
          '<div class="blog-card-media">',
            '<img class="blog-card-img" src="' + esc(post.image) + '" alt="' + esc(post.title) + '" loading="lazy" decoding="async">',
          '</div>',
          '<div class="blog-card-body">',
            '<time class="blog-card-date" datetime="' + esc(post.date) + '">' + esc(formatDate(post.date)) + '</time>',
            '<h3 class="blog-card-title">' + esc(post.title) + '</h3>',
            '<p class="blog-card-excerpt">' + esc(post.excerpt) + '</p>',
            '<span class="blog-card-cta">Baca Artikel <span aria-hidden="true">&#8594;</span></span>',
          '</div>',
        '</a>',
      '</article>'
    ].join('');
  }

  /* ---------------------------------------------------------------------------
     1. Homepage preview carousel — WAI-ARIA carousel pattern
        - Track is tabindex="0": arrow-key scrolling works (WCAG 2.1.1)
        - Prev/next are native <button>s (Enter/Space work out of the box)
        - aria-live status only announces when the visible index changes
     ------------------------------------------------------------------------ */
  function renderCarousel() {
    var track = document.getElementById('blog-carousel-track');
    if (!track) {
      return;
    }

    var posts = getPosts().slice(0, HOME_CAROUSEL_COUNT);
    if (!posts.length) {
      return;
    }

    track.innerHTML = posts.map(function (post, index) {
      return '<div class="blog-carousel-slide" role="group" aria-roledescription="slaid" ' +
        'aria-label="Artikel ' + (index + 1) + ' daripada ' + posts.length + '">' +
        cardMarkup(post) + '</div>';
    }).join('');

    var prevBtn = document.getElementById('blog-carousel-prev');
    var nextBtn = document.getElementById('blog-carousel-next');
    var status = document.getElementById('blog-carousel-status');
    var lastAnnounced = -1;

    function slideStep() {
      var slide = track.querySelector
        ? track.querySelector('.blog-carousel-slide')
        : null;
      if (!slide || !slide.getBoundingClientRect) {
        return track.clientWidth || 1;
      }
      var width = slide.getBoundingClientRect().width || 0;
      var gap = 0;
      if (window.getComputedStyle) {
        var styles = window.getComputedStyle(track);
        gap = parseFloat(styles.columnGap || styles.gap) || 0;
      }
      return (width + gap) || track.clientWidth || 1;
    }

    function update() {
      var max = track.scrollWidth - track.clientWidth;
      if (prevBtn) {
        prevBtn.disabled = track.scrollLeft <= 2;
      }
      if (nextBtn) {
        nextBtn.disabled = max <= 0 || track.scrollLeft >= max - 2;
      }
      if (status) {
        var index = Math.round(track.scrollLeft / slideStep()) + 1;
        if (index < 1) { index = 1; }
        if (index > posts.length) { index = posts.length; }
        if (index !== lastAnnounced) {
          lastAnnounced = index;
          status.textContent = 'Artikel ' + index + ' daripada ' + posts.length;
        }
      }
    }

    function scrollBySlide(direction) {
      var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var behavior = reduceMotion ? 'auto' : 'smooth';
      if (track.scrollBy) {
        track.scrollBy({ left: direction * slideStep(), behavior: behavior });
      } else {
        track.scrollLeft += direction * slideStep();
        update();
      }
    }

    if (prevBtn && prevBtn.addEventListener) {
      prevBtn.addEventListener('click', function () { scrollBySlide(-1); });
    }
    if (nextBtn && nextBtn.addEventListener) {
      nextBtn.addEventListener('click', function () { scrollBySlide(1); });
    }

    var ticking = false;
    if (track.addEventListener) {
      track.addEventListener('scroll', function () {
        if (ticking) {
          return;
        }
        ticking = true;
        var done = function () { ticking = false; update(); };
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(done);
        } else {
          done();
        }
      }, { passive: true });
    }
    if (window.addEventListener) {
      window.addEventListener('resize', update);
    }

    update();
  }

  /* ---------------------------------------------------------------------------
     2. Blog index grid (blog.html) — renders all posts from metadata
     ------------------------------------------------------------------------ */
  function renderGrid() {
    var grid = document.getElementById('blog-grid');
    if (!grid) {
      return;
    }
    grid.innerHTML = getPosts().map(cardMarkup).join('');
  }

  /* ---------------------------------------------------------------------------
     3. Article prev/next navigation (blog/*.html)
     ------------------------------------------------------------------------ */
  function renderArticleNav() {
    var nav = document.getElementById('blog-article-nav');
    if (!nav) {
      return;
    }
    var posts = getPosts();
    var slug = nav.getAttribute ? nav.getAttribute('data-current-slug') : null;
    var index = -1;
    var i;
    for (i = 0; i < posts.length; i += 1) {
      if (posts[i].slug === slug) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      nav.style.display = 'none';
      return;
    }

    var prev = index > 0 ? posts[index - 1] : null;
    var next = index < posts.length - 1 ? posts[index + 1] : null;
    if (!prev && !next) {
      nav.style.display = 'none';
      return;
    }

    var html = '';
    if (prev) {
      html += '<a class="blog-article-nav-link is-prev" href="' + esc(postHref(prev)) + '" rel="prev">' +
        '<span class="blog-article-nav-label"><span aria-hidden="true">&#8592;</span> Artikel Sebelumnya</span>' +
        '<span class="blog-article-nav-title">' + esc(prev.title) + '</span></a>';
    }
    if (next) {
      html += '<a class="blog-article-nav-link is-next" href="' + esc(postHref(next)) + '" rel="next">' +
        '<span class="blog-article-nav-label">Artikel Seterusnya <span aria-hidden="true">&#8594;</span></span>' +
        '<span class="blog-article-nav-title">' + esc(next.title) + '</span></a>';
    }
    nav.innerHTML = html;
  }

  function init() {
    try {
      renderCarousel();
      renderGrid();
      renderArticleNav();
    } catch (error) {
      if (window.console && window.console.error) {
        console.error('[blog.js]', error);
      }
    }
  }

  /* Exposed for smoke tests / progressive-enhancement debugging */
  window.InaiBlogUI = {
    formatDate: formatDate,
    cardMarkup: cardMarkup,
    postHref: postHref
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
