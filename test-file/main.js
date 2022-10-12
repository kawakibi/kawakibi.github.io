(function ($) {
  $.fn.kslzy = function (threshold, callback) {
    var $w = $(window),
      images = this,
      threshold = threshold || 0;

    function checkVisible(elm, checker) {
      checker = checker || "visible";
      var spolier = $(elm).closest(".spoiler");
      if (spolier.length == 1) {
        elm = spolier;
      }
      var vpH = $w.height(), // Viewport Height
        st = $w.scrollTop(), // Scroll Top
        y = $(elm).offset().top,
        elementHeight = $(elm).height();
      //console.log("elm = "+elm+" y = "+y+" scrollTop = "+st+ " elementHeight = "+elementHeight+" Viewport = "+vpH+" threshold ="+threshold);
      if (checker == "visible")
        return y < vpH + st + threshold && y > st - elementHeight - threshold;
      if (checker == "above") return y < vpH + st;
    }

    this.one("display", function () {
      var downloadingImage = new Image();
      if ($(this).prop("tagName") == "DIV" || $(this).prop("tagName") == "A") {
        var currElem = this;
        downloadingImage.onload = function () {
          $(currElem)
            .removeClass("mls-img")
            .addClass("rjn-img")
            .removeAttr("data-src")
            .hide()
            .fadeIn();

          if ($(currElem).attr("data-type") == "1") {
            $(currElem).css("background-image", "url(" + this.src + ")");
          } else {
            var img = $('<img class="lte-img">');
            img.attr("src", this.src);
            img.appendTo($(currElem));
          }
        };
      } else {
        var currImage = this;
        downloadingImage.onload = function () {
          $(currImage)
            .removeClass("mls-img")
            .addClass("rjn-img")
            .removeAttr("data-src");

          $(currImage).attr("src", this.src);
        };
      }
      if (typeof $(this).attr("data-src") != "undefined") {
        downloadingImage.src = $(this).attr("data-src");
      }
    });

    this.one("fetch_twitter", function () {
      var elm = $(this).prev();
      var twitterurl = $(this).data("url");
      $.ajax({
        url: "https://publish.twitter.com/oembed?url=" + twitterurl,
        type: "GET",
        dataType: "jsonp",
        success: function (response) {
          if (typeof response !== "object") {
            response = $.parseJSON(response);
          }
          $(elm).css("max-width", "480px");
          if (response.html) {
            $(elm).children("div").html(response.html);
          } else {
            $(elm)
              .children("div")
              .html(
                '<img src="' +
                  assetsFolderNew +
                  '/images/image-twitter-invalid-placeholder.svg">'
              );
          }
        },
        error: function (xhr, status, error) {
          $(elm).css("max-width", "480px");
          $(elm)
            .children("div")
            .html(
              '<img src="' +
                assetsFolderNew +
                '/images/image-twitter-invalid-placeholder.svg">'
            );
        },
      });
    });

    this.one("fetch_instagram", function () {
      var elm = $(this).prev();
      var urlinstagram = $(this).data("url");
      $.ajax({
        url:
          "https://graph.facebook.com/v8.0/instagram_oembed?url=" +
          urlinstagram +
          "&access_token=" +
          FACEBOOK_CLIENT_TOKEN,
        type: "GET",
        dataType: "json",
        success: function (data) {
          if (typeof data !== "object") {
            data = $.parseJSON(data);
          }
          if (data.html) {
            $(elm).html(data.html);
          } else {
            $(elm).html(
              '<img src="' +
                assetsFolderNew +
                '/images/image-ig-invalid-placeholder.svg" style="max-width:480px">'
            );
          }
        },
        error: function (xhr, status, error) {
          $(elm).html(
            '<img src="' +
              assetsFolderNew +
              '/images/image-ig-invalid-placeholder.svg" style="max-width:480px">'
          );
        },
      });
    });

    this.one("append_tv_ht", function () {
      let el = $(this);
      if (ht_tv_result_array.length > 0) {
        let currentData = ht_tv_result_array.shift();
        el.find(".jsHtTvUsername").html(currentData.username);
        el.find(".jsHtTvUsername").attr("href", currentData.program_url);
        el.find(".jsHtTvChannel").attr("href", currentData.channel_url);
        el.find(".jsHtTvChannel").html(currentData.channel_name);
        el.find(".jsHtTvDate").html(currentData.published_at);
        el.find(".jsHtTvTitle").html(currentData.title);
        el.find(".jsHtTvIframe iframe").attr("src", currentData.iframe_url);
        el.find(".jsHtTvIframe iframe").show();
        el.find(".jsHtTvIframe iframe").attr("title", currentData.title_slug);
        el.find(".jsHtTvThumbnail img").attr("src", currentData.thumbnail_url);
        el.find(".jsHtTvThumbnail img").attr("alt", currentData.title_slug);
        el.find(".jsHtTvReputation").html(currentData.like_dislike);
        el.find(".jsHtTvViews").html(currentData.view_count);
        el.find(".jsHtTvReplies").html(currentData.reply_count);
        el.find(".jsHtTvLink.jsHtTvTitle").attr(
          "href",
          currentData.title_url_track
        );
        el.find(".jsHtTvLink.jsHtTvThumbnail").attr(
          "href",
          currentData.thumbnail_url_track
        );
        el.find(".fa-arrow-alt-up")
          .parents(".jsHtTvLink")
          .attr("href", currentData.upvote_url_track);
        el.find(".fa-arrow-alt-down")
          .parents(".jsHtTvLink")
          .attr("href", currentData.downvote_url_track);
        el.find(".jsHtTvReplies")
          .parents(".jsHtTvLink")
          .attr("href", currentData.reply_url_track);
        el.find(".jsHtDetailLink").attr("href", currentData.elipsis_url_track);
        el.find(".fa-share-alt")
          .parents(".jsHtTvLink")
          .attr("href", currentData.share_url_track);
        el.find(".jsHtTvIcon").attr("src", currentData.portrait_thumbnail_url);
        el.find(".jsThreadCardTvView").show();
        el.removeClass("jsThreadCardTv");
      } else {
        el.hide();
      }
    });

    function scan() {
      var inview = images.filter(function () {
        if ($(this).is(":visible") == false) return false;

        return checkVisible($(this));
      });

      var loaded = "";
      if (typeof callback !== "undefined") {
        loaded = inview.trigger(callback);
      } else {
        loaded = inview.trigger("display");
      }
      // console.log(inview);
      images = images.not(loaded);
    }

    $w.on("scroll.kslzy resize.kslzy lookup.kslzy click.kslzy", scan);

    scan();

    return this;
  };
})(window.jQuery || window.Zepto);


function build_ga_track_event(category, action, label) {
  var gtm_event_code = "dataLayer.push({'event': 'trackEvent','eventDetails.category': " + category + ", 'eventDetails.action': " + action + ", 'eventDetails.label': " + label + "});";

  return gtm_event_code;
}

function build_ga_track_event_custom(category, action, label, additional_data) {
  var gtm_event_code = "dataLayer.push({'event': 'trackEvent', 'eventDetails.category': " + category + ",'eventDetails.action': " + action + ", 'eventDetails.label': " + label + "," + additional_data + "});";

  return gtm_event_code;
}

function build_ga_custom_track_share_thread(category, action, label, el, customDimension) {
  var threadId = el.attr('data-threadid');
  var threadTitle = decodeURIComponentSafe(el.attr('data-title')).replace('&#92;', "");
  var author = el.attr('data-author');
  var forumId = el.attr('data-forum-id');
  var forumName = el.attr('data-forum-name');
  var forumParentId = el.attr('data-forum-parent-id');
  var forumParentName = el.attr('data-forum-parent-name');
  var channelId = el.attr('data-channel-id');
  var channelName = el.attr('data-channel-name');
  var share_menu_user_id = user_id;
  var profile_user_id = el.attr('data-profile-user-id');
  if (typeof profile_user_id !== typeof undefined && profile_user_id !== false) {
    share_menu_user_id = profile_user_id;
  }
  var trackObject = {
    'event': 'trackEvent',
    'eventDetails.category': category,
    'eventDetails.action': action,
    'eventDetails.label': label,
    'threadShared': '1',
    'userID': share_menu_user_id,
    'threadId': threadId,
    'threadTitle': threadTitle,
    'author': author,
    'forumId': forumId,
    'forumName': forumName,
    'forumParentId': forumParentId,
    'forumParentName': forumParentName,
    'channelId': channelId,
    'channelName': channelName
  };

  if(customDimension) {
    trackObject = Object.assign(trackObject, customDimension);
  }

  var gtm_event_code = 'dataLayer.push(' + JSON.stringify(trackObject).replace(/"/g, "'") + ');';

  return gtm_event_code;
}

function decodeURIComponentSafe(uri, mod) {
  var out = new String(),
    arr, i = 0,
    l, x;
  typeof mod === "undefined" ? mod = 0 : 0;
  arr = uri.split(/(%(?:d0|d1)%.{2})/);
  for (l = arr.length; i < l; i++) {
    try {
      x = decodeURIComponent(arr[i]);
    } catch (e) {
      x = mod ? arr[i].replace(/%(?!\d+)/g, '%25') : arr[i];
    }
    out += x;
  }
  return out;
}

function buildAdditionalCustomMetricAttr(el) {
  var author = el.attr('data-author');
  var title = decodeURIComponentSafe(el.attr('data-title')).replace('&#92;', "");
  var forum_id = el.attr('data-forum-id');
  var forum_name = el.attr('data-forum-name');
  var forum_parent_id = el.attr('data-forum-parent-id');
  var forum_parent_name = el.attr('data-forum-parent-name');
  var channel_id = el.attr('data-channel-id');
  var channel_name = el.attr('data-channel-name');
  var subscribe_user_id = user_id;
  var profile_user_id = el.attr('data-profile-user-id');
  if (typeof profile_user_id !== typeof undefined && profile_user_id !== false) {
    subscribe_user_id = profile_user_id;
  }
  var attr = 'data-userid="' + subscribe_user_id + '" ' +
    'data-author="' + author + '" ' +
    'data-title="' + title + '" ' +
    'data-forumid="' + forum_id + '" ' +
    'data-forum-name="' + forum_name + '" ' +
    'data-forum-parentid="' + forum_parent_id + '" ' +
    'data-forum-parent-name="' + forum_parent_name + '" ' +
    'data-channelid="' + channel_id + '" ' +
    'data-channel-name="' + channel_name + '" ';
  return attr;
}

function createThreadlistShareMenuData(elThreadListMenu) {
  var divMenu = elThreadListMenu.parent().find('.jsPopoverMenu:first');
  if (divMenu.attr('data-created') == 'false') {
    var is_thread_subscription = divMenu.attr('data-thread-subscription');
    var subscribe_tracking = divMenu.attr('data-subscribe-tracking');
    var subscribe_label = divMenu.attr('data-subscribe-label');
    var is_subscribe = divMenu.attr('data-is-subscribe');
    var threadid = divMenu.attr('data-threadid');
    var forum_id = divMenu.attr('data-forum-id');
    var title = decodeURIComponentSafe(divMenu.attr('data-title')).replace('&#92;', "");
    var slugtitle = divMenu.attr('data-slugtitle');
    var show_button_first_post = divMenu.attr('data-show-button-first-post');
    var show_button_last_post = divMenu.attr('data-show-button-goto-last-post');
    var last_post_id = divMenu.attr('data-last-post-id');
    var fb_href = divMenu.attr('data-fb-href');
    var fb_url = divMenu.attr('data-fb-url');
    var twitter_href = divMenu.attr('data-twitter-href');
    var subscribeMenuString = '';
    if (is_subscribe == 'true') {
      subscribeMenuString =
        '<a '+
        'href="javascript:void(0);"' +
        'class="D(b) C(c-normal) Bgc(c-lightgrey):h My(3px) Py(5px) Px(10px) jsSubscribeThreadIcon"'+
        'data-type="thread" ' +
        ((is_thread_subscription == 'true') ? 'data-thread-subscription="true" ' : '') +
        'data-id="' + threadid + '" ' +
        buildAdditionalCustomMetricAttr(divMenu) +
        'data-label="' + subscribe_label + '" ' +
        'data-state="unsubscribe" ' +
        'data-style="menu" ' +
        'data-category="' + subscribe_tracking + '"> ' +
        '<i class="Mend(12px) Va(m) fas Fz(14px) fa-bookmark fa-fw"></i>' +
        '<span class="Fz(12px)">' + window.KASKUS_lang.unsubscribe_button + '</span> ' +
        '</a>';
    } else {
      subscribeMenuString =
        '<a ' +
        'href="javascript:void(0);" ' +
        'class="D(b) C(c-normal) Bgc(c-lightgrey):h My(3px) Py(5px) Px(10px) jsSubscribeThreadIcon"'+
        'data-type="thread" ' +
        'data-id="' + threadid + '" ' +
        buildAdditionalCustomMetricAttr(divMenu) +
        'data-label="' + subscribe_label + '" ' +
        'data-state="subscribe" ' +
        'data-style="menu" ' +
        'data-category="' + subscribe_tracking + '"> ' +
        '<i class="Mend(12px) Va(m) fas Fz(14px) fa-bookmark fa-fw"></i> ' +
        '<span class="Fz(12px)">' + window.KASKUS_lang.subscribe_button + '</span> ' +
        '</a>';
    }
    var firstPostButtonString = '';
    if (show_button_first_post == 'true') {
      firstPostButtonString =
        '<li class="D(b)">' +
        '<a href="/thread/' + threadid + '/' + slugtitle + '?goto=newpost" class="D(b) C(c-normal) Bgc(c-lightgrey):h My(3px) Py(5px) Px(10px)">' +
        '<i class="Mend(12px) Va(m) fas Fz(14px) fa-chevron-square-down fa-fw"></i> ' +
        '<span class="Fz(12px)">' + window.KASKUS_lang.go_first_new_post_button + '</span> ' +
        '</a> '+
        '</li>';
    }
    var lastPostButtonString = '';
    if (show_button_last_post == 'true') {
      lastPostButtonString =
          '<li class="D(b)">' +
          '<a href="/lastpost/' + threadid + '#post' + last_post_id + '" class="D(b) C(c-normal) Bgc(c-lightgrey):h My(3px) Py(5px) Px(10px)" rel="nofollow"> ' +
          '<i class="Mend(12px) Va(m) fas Fz(14px) fa-chevron-square-right fa-fw"></i> ' +
          '<span class="Fz(12px)">' + window.KASKUS_lang.go_last_post_button + '</span> ' +
          '</a>' +
          '</li>';
    }
    var showShareBtn = '';
    if (fb_url != undefined || twitter_href != undefined) {
      showShareBtn = '<div class="H(1px) Bgc(#d4d4d4) Mx(10px)"></div> ';
      if (fb_url != undefined) {
        showShareBtn +=
          '<li class="D(b) Cur(p)"> ' +
          '<a href="javascript:void(0);" data-url="' + fb_url + '" data-threadid="' + threadid + '" onclick="threadlist_facebook_share(\'' + fb_url + '\', \'' + threadid + '\');' + build_ga_custom_track_share_thread("'" + forum_id + " " + title + "'", "'share thread'", "'facebook'", divMenu) + '" class="D(b) C(c-normal) Bgc(c-lightgrey):h My(3px) Py(5px) Px(10px)"> ' +
          '<i class="Mend(12px) Va(m) fab Fz(14px) fa-facebook-square fa-fw"></i> ' +
          '<span class="Fz(12px)">' + window.KASKUS_lang.share_facebook_button + '</span> ' +
          '</a>' +
          '</li>';
      }
      if (twitter_href != undefined) {
        showShareBtn +=
          '</li> ' +
          '<li class="D(b) Cur(p)"> ' +
          '<a target="_blank" href="' + twitter_href + '" data-threadid="' + threadid + '" onclick="threadlist_share_count(\'' + threadid + '\', \'twitter\');' + build_ga_custom_track_share_thread("'" + forum_id + " " + title + "'", "'share thread'", "'twitter'", divMenu) + '" class="D(b) C(c-normal) Bgc(c-lightgrey):h My(3px) Py(5px) Px(10px)"> ' +
          '<i class="Mend(12px) Va(m) fab Fz(14px) fa-twitter-square fa-fw"></i> ' +
          '<span class="Fz(12px)">' + window.KASKUS_lang.share_twitter_button + '</span> ' +
          '</a> ' +
          '</li> ';
      }
      showShareBtn += '<div class="H(1px) Bgc(#d4d4d4) Mx(10px)"></div>';
    }
    var elString =
    '<ul>' +
    '<li class="D(b) Cur(p)">' +
      subscribeMenuString +
    '</li>' +
      showShareBtn+
      firstPostButtonString +
      lastPostButtonString +
    '</ul>';

    divMenu.attr('data-created', 'true');
    divMenu.append($.parseHTML(elString));
    $(document).on("click", ".jsSubscribeThreadIcon", function () {
      subscribeUnsubscribe($(this));
    });
  }
}

function bindThreadListShareMenuData() {
  $('.jsThreadListShareMenuData').click(function() {
    createThreadlistShareMenuData($(this));
  });
}

function forumAllEventTracking() {
  if ($('.jsChannelForumButton').length) {
    $('.jsChannelForumButton').click(function() {
      var action = $(this).attr('data-state');
      var label = $(this).attr('data-id');
      dataLayer.push({
        'event': 'trackEvent',
        'eventDetails.category': 'forumall',
        'eventDetails.action': action + ' channel',
        'eventDetails.label': 'channel-' + label
      });
      if (action === 'open') {
        $(this).attr('data-state', 'close');
      } else {
        $(this).attr('data-state', 'open');
      }

    });
  }
}

function bindForumAllIconCancel() {
  if ($('#search-icon').length) {
    $('#search-icon').click(function() {
      if ($(this).hasClass('fa-times')) {
        $('#search-category').val('');
        hide_forum_all_search_result();
        change_forum_all_icon_search();
      }
    });
  }
}

function bindForumAllSearchResult() {
  if ($('#search-result').length && $('#search-result').children().length) {
    jQuery.expr[":"].icontains = function(a, i, m) {
      return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

    $('#search-category').keyup(function(event) {
      phrase = $(this).val();
      if (phrase === '' || phrase === undefined) {
        hide_forum_all_search_result();
        change_forum_all_icon_search();
        return false;
      }
      show_forum_all_search_result();
      change_forum_all_icon_cancel();

      $('#search-result').children().hide();
      search_container = $(".listForumItem span span:icontains(" + phrase + ")");
      search_container.closest(".listForumItem").show();
    });
  }
}

function bindForumAllSubscribeEvent() {
  if ($('[id^=bookmark-forum]').length) {
    $('[id^=bookmark-forum]').click(function() {
      subscribeUnsubscribe($(this));
      return false;
    });
  }
  if ($('[id^=bookmark-search-forum]').length) {
    $('[id^=bookmark-search-forum]').click(function() {
      subscribeUnsubscribe($(this));
      return false;
    });
  }
}

function show_forum_all_search_result() {
  $('.jsChannelForumItem').hide();
  $('#search-result').show();
}

function hide_forum_all_search_result() {
  $('.jsChannelForumItem').show();
  $('#search-result').hide();
}

function change_forum_all_icon_search() {
  if ($('#search-icon').hasClass('fa-times')) {
    $('#search-icon').removeClass('fa-times');
    $('#search-icon').addClass('fa-search');
  }
}

function change_forum_all_icon_cancel() {
  if ($('#search-icon').hasClass('fa-search')) {
    $('#search-icon').removeClass('fa-search');
    $('#search-icon').addClass('fa-times');
  }
}

/*
 * get trh in home / channel landing
 */
function bindTrhHome() {
  if ($('#recommended-thread-home').length > 0) {
    $.get(url_recommendation, function(result) {
      if (typeof result !== 'object') {
        result = $.parseJSON(result);
      }

      if (result.result !== false) {
        var trh_data = '';
        var display_trh = '';

        $.each(result.result, function(model_name, thread_data) {
          var counter = 1;
          var total_thread = Object.keys(thread_data).length;

          trh_data += '<div id="' + model_name + '" class="Px(15px) Py(15px) Bgc(c-white) Bd(borderSolidLightGrey) Mb(15px)"' + display_trh + '><div class="D(f) Ai(c) Mb(15px)">';
          trh_data += '<img src="' + assetsFolderNew + '/images/ic-rekomendasi-thread.svg" width="28" alt="recommended-thread">';
          trh_data += '<div><span class="Ff(VagRounded) Lts(0.2px) Fz(20px) Mstart(10px) D(ib) Mt(4px) Mend(5px)">';
          trh_data += window.KASKUS_LANG.thread_recommendation_title;
          trh_data += '</span></div></div>';

          $.each(thread_data, function(thread_id, thread_detail) {
            counter++;
            var additional_class = counter <= total_thread ? 'Bdb(borderSolidLightGrey) ' : '';
            trh_data += '<a class="C(c-dark-grey)" href="' + thread_detail['href'] + '" onclick="' + thread_detail['ga_track'] + '">';
            trh_data += '<div class="D(f) Mb(10px) ' + additional_class + 'Pb(15px)">';
            trh_data += '<div class="Fx(flexOne)">';
            trh_data += '<div class="C(c-dark-grey) Fz(14px) Lh(19px) Lts(0.1px) Fw(500)">' + thread_detail['title'] + '</div>';
            trh_data += '<a href="' + thread_detail['forum_href'] + '" class="C(c-secondary)" onclick="' + thread_detail['ga_track'] + thread_detail['ga_track_community'] + '">';
            trh_data += '<div class="Fz(12px) C(c-secondary) Mt(5px)">' + thread_detail['forum_name'] + '</div></a></div>';

            if (Boolean(thread_detail['data-img-src'])) {
              trh_data += '<a class="W(60px) H(60px) Fx(flexZero) Mstart(10px) Bdrs(5px) Bdrsbstart(0) Ov(h)" href="' + thread_detail['href'] + '" onclick="' + thread_detail['ga_track'] + '">';
              trh_data += '<img alt="' + thread_detail['slug_title'] + '" data-src="' + thread_detail['data-img-src'] + '" class="mls-img Bdrs(5px) Bdrsbstart(0) W(100%) oFitCover H(100%)" >';
              trh_data += '</a>';
            }

            trh_data += '</div></a>';
            display_trh = ' style="display: none;"';
          });

          trh_data += '</div>';
        });

        $('#recommended-thread-home').replaceWith(trh_data);
        $(".mls-img").kslzy(300);

        if (Object.keys(result.result).length > 1) {
          dataLayer.push({
            'event': 'optimize.activate'
          });
        }
      }
    });
  }
}
/*
 * get trh in forum landing / threadlist
 */
function bindTrhThreadList() {
  if ($('#recommended-thread-threadlist').length > 0) {
    $.post(url_recommendation, {
      hot_threads: hot_thread_data
    }, function(result) {
      if (typeof result !== 'object') {
        result = $.parseJSON(result);
      }

      if (result.result !== false) {
        var trh_data = '';

        trh_data += '<div class="Px(15px) Py(15px) Bgc(c-white) Bd(borderSolidLightGrey) Mb(15px)">';
        trh_data += '<div class="D(f) Ai(c) Mb(15px)">';
        trh_data += '<img src="' + assetsFolderNew + '/images/ic-rekomendasi-thread.svg" width="28" alt="recommended-thread">';
        trh_data += '<div>';
        trh_data += '<span class="Ff(VagRounded) Lts(0.2px) Fz(20px) Mstart(10px) D(ib) Mt(4px) Mend(5px)">' + window.KASKUS_LANG.thread_recommendation_title + '</span>';
        trh_data += '</div>';
        trh_data += '</div>';

        var empty_model = 0;
        var first_not_empty_model = '';
        var trh_exist = 0;
        $.each(result.result, function(model, threads) {
          if (Object.keys(threads).length == 0) {
            empty_model++;
          } else if (first_not_empty_model == '') {
            first_not_empty_model = model;
          }
        });

        $.each(result.result, function(model, threads) {
          var total_thread = Object.keys(threads).length;
          $.each(threads, function(thread_id, thread_detail) {
            trh_exist++;
            var additional_class = trh_exist < total_thread ? 'Bdb(borderSolidLightGrey) ' : '';
            var ga_track = thread_detail['ga_track'] ? ' onclick="' + thread_detail['ga_track'] + '"' : '';

            trh_data += '<a class="C(c-secondary) Td(n):h ' + thread_detail['model_name'] + '" href="' + thread_detail['href'] + '"' + ga_track + ' style="display: none;">';
            trh_data += '<div class="D(f) Mb(10px) ' + additional_class + 'Pb(15px)">';
            trh_data += '<div class="Fx(flexOne)">';
            trh_data += '<div class="C(c-dark-grey) Fz(14px) Lh(19px) Lts(0.1px) Fw(500)">' + thread_detail['title'] + '</div>';
            trh_data += '<div class="Fz(12px) C(c-secondary) Mt(5px)">' + thread_detail['thread_label'] + '</div>';
            trh_data += '</div>';

            if (Boolean(thread_detail['image_source'])) {
              trh_data += '<div class="Fx(flexZero) Mstart(10px) Bdrs(5px) Bdrsbstart(0) Ov(h) W(60px) H(60px)">';
              trh_data += '<img alt="' + thread_detail['slug_title'] + '" data-src="' + thread_detail['data-img-src'] + '" class="mls-img Bdrs(5px) Bdrsbstart(0) W(100%) oFitCover H(100%)" >';
              trh_data += '</div>';
            }

            trh_data += '</div>';
            trh_data += '</a>';
          });
        });

        trh_data += '</div>';


        if (trh_exist > 0) {
          $('#recommended-thread-threadlist').replaceWith(trh_data);
        }
        $(".mls-img").kslzy(300);

        if (first_not_empty_model != '') {
          $("." + first_not_empty_model).show();
        }

        if (Object.keys(result.result).length > 1 && empty_model == 0) {
          dataLayer.push({
            'event': 'optimize.activate'
          });
        }
      }
    });
  }
}

/**
 * subscribe thread
 */
function bindSubscribeButton() {
  if (typeof subscribeUnsubscribe === "function") {
    $('.jsSubscribeThreadIcon').unbind();
    $(document).on("click", ".jsSubscribeThreadIcon", function () {
      subscribeUnsubscribe($(this));
      return false;
    });
  } else {
    window.setTimeout(bindSubscribeButton, 1000);
  }
}

/**
 * whoposted
 */
function bindOpenWhoPosted() {
  if (typeof openWhoPosted === "function") {
    $('.openwhoposted').unbind();
    $('.openwhoposted').on('click', function(e) {
      e.preventDefault();
      openWhoPosted($(this));
    });
  } else {
    window.setTimeout(bindOpenWhoPosted, 1000);
  }
}

var whoposted_page = 1;
var whoposted_load_more = '<li id="whoposted-loadmore" class="D(f) Ai(c) Mb(15px)"><a data-id="whoposted-load-more" onclick="load_more_whoposted()" href="javascript:void(0)" class="D(b) W(100%) Bgc(#1998ed):h C(c-white):h Td(n):h D(b) Py(7px) Px(7px) Fw(500) Ta(c) C(#1998ed) Bd(borderSolidBlue) Bdrs(5px) Mb(10px)">Lihat Lainnya</a></li>';
var whoposted_urlAjax = '';

function openWhoPosted(el) {
  whoposted_page = 1;
  whoposted_urlAjax = el.attr('href');
  $('#jsModalWhoPosted').empty();
  var html_view = '<div class="modal-dialog jsModalDialog Ov(h)">' +
              '<div class="modal-content jsModalContent">' +
                '<div class="modal-section W(400px)">' +
                  '<div class="modal-header H(140px) Bgc(c-aqua-light) Bdrs(5px) Pos(r) Maw(360px) Mx(a) Bdrsbend(0) Bdrsbstart(0)">' +
                    '<div class="W(100%) H(130px) Bg(bgImageProps) Bgi(imagePopupWhoposted) Pos(a) B(0)"></div>' +
                    '<button class="Pos(a) End(10px) T(10px) jsModalCloseButton Z(1)" type="button">' +
                      '<i class="fas fa-times C(#6e6e6e) Fz(20px)"></i>' +
                    '</button>' +
                  '</div>' +
                  '<div class="modal-body Bgc(c-white) Bdrs(5px) Py(15px) Px(40px)">' +
                    '<div class="Fz(18px) Fw(700) Mb(20px)">Who Posted</div>' +
                    '<div class="D(f) Jc(sb) Ai(c) Fz(13px) C(c-normal) Py(8px)">' +
                      '<div>Username</div>' +
                      '<div class="W(80px)" id="whoposted_total_post">Post</div>' +
                    '</div>' +
                    '<div class="Ovy(a) Mah(350px) Mb(15px) Mt(10px)">' +
                      '<div class="D(f) Fld(c)" id="whoposted_list_user">' +
                        '<ul>';
  html_view += '<img id="whoposted-loading-image" src="' + assetsFolderNew + '/images/icon-load-biru.gif" width="40" height="40" alt="notification-loading" />';
  html_view += '</ul></div></div></div></div></div></div>';
  $("#jsModalWhoPosted").html(html_view);
  bindJsModalCloseButton();

  $.ajax({
    url: whoposted_urlAjax + '/?whoposted_page=' + whoposted_page,
    success: function(result) {
      if (typeof result !== 'object') {
        result = $.parseJSON(result);
      }
      $('#whoposted_list_user').empty();

      whoposted_data = result.result.whoposted;
      post_userid = result.result.post_userid;
      thread_id = result.result.thread_id;
      total_post = (parseInt(result.result.total_post) || 0);
      whoposted_page = result.result.next_page;
      page_remaining = result.result.page_remaining;
      html_view = "<ul>";
      if (Object.keys(whoposted_data).length > 0) {
        $.each(whoposted_data, function(key, post_info) {
          if (typeof post_info.userid !== 'undefined' ) {
            html_view += '<li class="D(f) Ai(c) Mb(15px)">' +
                    '<a href="/profile/' + post_info.userid + '" target="_blank">' +
                      '<div class="Pos(r)">' +
                        '<img src="' + post_info.profile_picture + '" class="W(36px) H(36px) Bdrs(50%)">' +
                        ((post_info.is_online) ? '<i class="W(12px) H(12px) Bdrs(50%) Bgc(c-green) Pos(a) End(0) B(0) Bd(borderSolidGreen)"></i>' : '') +
                      '</div>' +
                    '</a>' +
                    '<div class="Fx(flexOne) Mx(10px) Ta(start)">' +
                      '<a href="/profile/' + post_info.userid + '" class="C(c-normal) D(f) Ai(c) Jc(fs) Mb(5px)" target="_blank">' +
                      ((post_info.userid == post_userid) ? '<span class="Bgc(#f8c31c) Bdrs(5px) P(3px) Fw(b) Fz(11px) Mend(5px)">TS</span>' : '') +
                        '<div class="Fz(13px) Fw(500)">' + post_info.username + '</div>' +
                      '</a>' +
                      '<div class="C(#a3a3a3) Fz(11px)">' + post_info.user_title + '</div>' +
                    '</div>' +
                    '<div class="W(80px)">' +
                      '<a href="/viewallposts/' + post_info.userid + '?thread_id=' + thread_id + '&count=' + post_info.total_post + '" class="Td(u):h C(c-normal) Fz(12px) Fw(500) Ta(c)">' + post_info.total_post + '</a>' +
                    '</div>' +
                  '</li>';
          }
        });
      } else {
        html_view = '<ul><li class="D(f) Ai(c) Mb(15px)">Empty Post</li></ul>';
      }
      html_view += "</ul>";
      $('#whoposted_total_post').html('Post(' + total_post + ')');
      $('#whoposted_list_user').html(html_view);
      if (page_remaining > 0) {
        $("#whoposted_list_user ul").append(whoposted_load_more);
      }
    }
  });

  return false;
}

//remove dropdown when option empty
function bindShowOrHideSelect2Dropdown() {
  $(".createThreadTagForm .select2, .sfthForm .select2, .jsShowTagSuggestionModal .select2").bind('click keyup', function () {
    let optionBool = $( "ul.select2-results__options" ).children("li").map(function(){ return $(this).attr('aria-selected') })
    let checker = arr => arr.toArray().every(v => v === 'true');
    if(checker(optionBool)){
      $(this).closest("body").find($(".select2-dropdown")).css("display","none");
    }else{
      $(this).closest("body").find($(".select2-dropdown")).css("display","block");
    }
  });
}

function load_more_whoposted()
{
  $('#whoposted-loadmore').hide();
  html_view = '<img id="whoposted-loading-image" src="' + assetsFolderNew + '/images/icon-load-biru.gif" width="40" height="40" alt="notification-loading" />';
  $('#whoposted_list_user ul').append(html_view);
  $.ajax({
    url: whoposted_urlAjax + '/?whoposted_page=' + whoposted_page,
    success: function(result) {
      if (typeof result !== 'object') {
        result = $.parseJSON(result);
      }

      whoposted_data = result.result.whoposted;
      post_userid = result.result.post_userid;
      thread_id = result.result.thread_id;
      whoposted_page = result.result.next_page;
      page_remaining = result.result.page_remaining;
      html_view = '';
      if (Object.keys(whoposted_data).length > 0) {
        $.each(whoposted_data, function(key, post_info) {
          if (typeof post_info.userid !== 'undefined' ) {
            html_view += '<li class="D(f) Ai(c) Mb(15px)">' +
                    '<a href="/profile/' + post_info.userid + '" target="_blank">' +
                      '<div class="Pos(r)">' +
                        '<img src="' + post_info.profile_picture + '" class="W(36px) H(36px) Bdrs(50%)">' +
                        ((post_info.is_online) ? '<i class="W(12px) H(12px) Bdrs(50%) Bgc(c-green) Pos(a) End(0) B(0) Bd(borderSolidGreen)"></i>' : '') +
                      '</div>' +
                    '</a>' +
                    '<div class="Fx(flexOne) Mx(10px) Ta(start)">' +
                      '<a href="/profile/' + post_info.userid + '" class="C(c-normal) D(f) Ai(c) Jc(fs) Mb(5px)" target="_blank">' +
                      ((post_info.userid == post_userid) ? '<span class="Bgc(#f8c31c) Bdrs(5px) P(3px) Fw(b) Fz(11px) Mend(5px)">TS</span>' : '') +
                        '<div class="Fz(13px) Fw(500)">' + post_info.username + '</div>' +
                      '</a>' +
                      '<div class="C(#a3a3a3) Fz(11px)">' + post_info.user_title + '</div>' +
                    '</div>' +
                    '<div class="W(80px)">' +
                      '<a href="/viewallposts/' + post_info.userid + '?thread_id=' + thread_id + '&count=' + post_info.total_post + '" class="Td(u):h C(c-normal) Fz(12px) Fw(500) Ta(c)">' + post_info.total_post + '</a>' +
                    '</div>' +
                  '</li>';
          }
        });
      }

      $('#whoposted_list_user ul').append(html_view);
      $('#whoposted-loadmore').remove();
      $('#whoposted-loading-image').remove();
      if (page_remaining > 0) {
        $("#whoposted_list_user ul").append(whoposted_load_more);
      }
    }
  });
}

function bindJsModalCloseButton()
{
  $('.jsModalCloseButton').click(function() {
    $('.jsModal').removeClass('is-open');
    $('body').removeClass('Ov(h)');
  });
}

$('.openwhoposted').on('click', function(e) {
  e.preventDefault();
  openWhoPosted($(this));
});

var htLoadNumber = 0;
var load_ht_without_cursor = 1;
var ht_is_loading = false;
/*
 * show list of HT
 */
function show_ht_channel(channel_id) {
  show_request_fcm_popup();
  ht_is_loading = true;
  var scrollCurrent = $(window).scrollTop();
  var next_ht_button = '<a id="ht-next" class="Bgc(#1998ed):h C(c-white):h Td(n):h D(b) Py(7px) Px(7px) Fw(500) Ta(c) C(#1998ed) Bd(borderSolidBlue) Bdrs(5px) Mb(10px)" data-tracking="' + data_tracking + '" data-channel="' + channel_id + '">Lanjut Gan!</a>';
  var counter = $('#ht_counter').val();
  var ht_cursor = $('#ht_cursor').val();
  var ht_hash_key = $('#ht_hash_key').val();
  var is_channel_for_you = $('#channel_for_you').val();

  $('#ht-loading-area').html(next_ht_image);
  $.ajax({
    url: "/misc/get_hotthread_channel/" + counter + '/' + channel_id,
    dataType: 'json',
    type: 'post',
    data: {
      cursor: ht_cursor,
      disable_cursor: load_ht_without_cursor,
      exc_thread_ids: ht_hash_key,
      is_channel_for_you : is_channel_for_you
    },
    success: function(response) {
      $(response.html).insertBefore($("#ht-loading-area"));
      $('#ht-loading-area').html(next_ht_button);
      $('#ht_counter').val(response.counter);

      var old_cursor = $('#ht_cursor').val();

      if (load_ht_without_cursor == 0) {
        if (!response.cursor || response.cursor == "*" || old_cursor == response.cursor) {
          removeHtAutoload();
        }
      } else {
        bindHtNext();
      }
      load_ht_without_cursor = response.next;
      $('#ht_cursor').val(response.cursor);
      ht_is_loading = false;
      $(".mls-img").kslzy(300);
      $('.jsThreadCardTv').kslzy(300, 'append_tv_ht')
      window.scrollTo(0, scrollCurrent);
      $(document.body).trigger("sticky_kit:recalc");
      window.scrollTo(0, scrollCurrent + 1);
      bindSubscribeButton();
      bindOpenWhoPosted();
      bindThreadListShareMenuData();
      bindJsTippy();
      htLoadNumber++;
      dataLayer.push({
        'event': 'trackEvent',
        'eventDetails.category': data_tracking,
        'eventDetails.action': 'load more ' + htLoadNumber,
        'eventDetails.label': 'hot thread'});
    },
    error: function() {
      ht_is_loading = false;
      removeHtAutoload();
    }
  });
}

function removeHtAutoload() {
  window.removeEventListener("resize", htloadnext);
  window.removeEventListener("scroll", htloadnext);
  window.removeEventListener("touch", htloadnext);
  window.removeEventListener("click", htloadnext);
  $('#ht-next').hide();
}

function htloadnext() {
  if (ht_is_loading == false && isElementInViewport($('#ht-next'))) {
    var data_channel = $('#ht-next').attr('data-channel');
    var data_tracking = $('#ht-next').attr('data-tracking');
    show_ht_channel(data_channel);
  }
}

function bindHtNext() {
  if ($('#ht-next').length > 0) {
    window.addEventListener("resize", htloadnext, {
      passive: !0
    });
    window.addEventListener("scroll", htloadnext, {
      passive: !0
    });
    window.addEventListener("touch", htloadnext, {
      passive: !0
    });
    window.addEventListener("click", htloadnext, {
      passive: !0
    });
  }
}

function isElementInViewport(elm, threshold) {
  threshold = threshold || 0;
  $w = $(window);
  var vpH = $w.height(), // Viewport Height
    st = $w.scrollTop(), // Scroll Top
    y = $(elm).offset().top,
    elementHeight = $(elm).height();
  return ((y < (vpH + st + threshold)) && (y > (st - elementHeight - threshold)));
}

var tl_limit = 20;
var tl_is_loading = false;
var tl_page = 1;

/*
 * show list of thread
 */
function show_thread_list(sort, cursor, order, feedtype, channelId) {
  tl_is_loading = true;
  var scrollCurrent = $(window).scrollTop();
  $.post("/misc/get_threadlist_forum_landing/", {
    sort: sort,
    cursor: cursor,
    order: order,
    feedtype : feedtype,
    channel : channelId
  }, function(response) {
    tl_page++;
    var item_count = response.totalcount;
    $(response.html).insertBefore($("#threadlist-loading-area"));
    $('#tl_cursor').val(response.cursor);

    $(".mls-img").kslzy(300);
    window.scrollTo(0, scrollCurrent);
    $(document.body).trigger("sticky_kit:recalc");
    window.scrollTo(0, scrollCurrent + 1);
    bindSubscribeButton();
    bindOpenWhoPosted();
    bindThreadListShareMenuData();
    bindJsTippy();

    if (item_count < tl_limit || tl_page > 1000) {
      $('#threadlist-loading-area').hide();
      window.removeEventListener("resize", tlload);
      window.removeEventListener("scroll", tlload);
      window.removeEventListener("touch", tlload);
      window.removeEventListener("click", tlload);
    } else {
      tl_is_loading = false;
    }
  }, "json");
}

/**
 * notice cookie
 */
function updateNotice(notice_id) {
  var cookie_data = $.parseJSON($.cookie('notices'));
  cookie_data.push(notice_id);
  $.cookie('notices', JSON.stringify(cookie_data), {
    expires: null,
    path: "/",
    domain: "",
    secure: false
  });
}

function bindNotice() {
  if ($('.btn_close').length > 0) {
    $('.btn_close').click(function() {
      var shown_notice = $(this).closest('.jsNoticeBoard');
      var notice_id = shown_notice.attr('data-id');
      updateNotice(notice_id);
      shown_notice.remove();
    });
  }
}

/**
 * set display type
 */
function setThreadDisplay(landing) {
  var islist = $('body').hasClass('is-title');
  var iscompact = $('body').hasClass('is-compact');
  var targettype = 'compact';
  if (iscompact) {
    targettype = 'thumb';
  }
  if (landing == 'forum' && !islist) {
    targettype = 'list';
  }
  $.ajax({
    url: "/misc/set_thread_list_display/" + targettype + "/" + landing,
    success: function(resp) {
      location.reload();
    },
    error: function() {}
  });
}

function bindSetThreadDisplay() {
  if ($('.jsCompactTrigger').length > 0) {
    var data_style = $('.jsCompactTrigger').attr('data-style');
    $('.jsCompactTrigger').click(function() {
      setThreadDisplay(data_style);
    });
  }
}

function setFeedDisplay(targettype) {
  $('.jsFeedTrigger').unbind( "click" );
  $.ajax({
    url: "/misc/set_feed_display/" + targettype,
    success: function(resp) {
      bindSetFeedDisplay();
      if (location.search == "") {
        window.location = '';
      } else {
        var loc = new URLSearchParams(location.search);
        loc.delete('feed');
        window.location = '?' + loc;
      }
    },
    error: function() {
      bindSetFeedDisplay();
    }
  });
}

function bindSetFeedDisplay() {
  if ($('.jsFeedTrigger').length > 0) {
    $('.jsFeedTrigger').click(function() {
      var data_style = $(this).attr('data-style');
      setFeedDisplay(data_style);
    });
  }
}

function setSubscribedForumOrder(orderType) {
  $('.jsSubsForumTrigger').unbind( "click" );
  $.ajax({
    url: "/myforum/set_subscribed_forum_order/" + orderType,
    success: function(resp) {
      bindSetSubscribedForumOrder();
      location.reload();
    },
    error: function() {
      bindSetSubscribedForumOrder();
    }
  });
}

function bindSetSubscribedForumOrder()
{
  if ($('.jsSubsForumTrigger').length > 0) {
    $('.jsSubsForumTrigger').click(function() {
      var data_type = $(this).attr('data-type');
      setSubscribedForumOrder(data_type);
    });
  }
}

function setSubscribedThreadTab(selectedTab) {
  $('.jsSubsThreadTrigger').unbind( "click" );
  $.ajax({
    url: "/myforum/set_subscribed_thread_tab/" + selectedTab,
    success: function() {
      bindSetSubscribedThreadTab();
      window.location = '/myforum/subscribe_thread'
    },
    error: function() {
      bindSetSubscribedThreadTab();
    }
  });
}

function bindSetSubscribedThreadTab()
{
  if ($('.jsSubsThreadTrigger').length > 0) {
    $('.jsSubsThreadTrigger').click(function() {
      var data_type = $(this).attr('data-type');
      setSubscribedThreadTab(data_type);
    });
  }
}

function bindSetSubcategoryItem(element) {
  if($(element).hasClass('is-selected')){
    $(element).removeClass('is-selected');
  }
  else{
    $(element).addClass('is-selected');
  }
  if($('.jsCategoryPersonalizationItem.is-selected').length == 0){
    $('.jsButtonSubscribe').addClass('is-disabled');
    $('.jsButtonSubscribe button').prop('disabled', true);
    $('.jsButtonSubscribe button').toggleClass('Bgc(c-grey-light) C(c-grey) Bgc(c-blue) Bgc(c-blue-hover):h C(c-white)');
  }
  else if($('.jsCategoryPersonalizationItem.is-selected').length == 1 && $('.jsButtonSubscribe').hasClass('is-disabled')){
    $('.jsButtonSubscribe').removeClass('is-disabled');
    $('.jsButtonSubscribe button').prop('disabled', false);
    $('.jsButtonSubscribe button').toggleClass('Bgc(c-grey-light) C(c-grey) Bgc(c-blue) Bgc(c-blue-hover):h C(c-white)');
  }
}

function bindSetjsCategoryPersonalizationItem() {
    $('#subscribedFeed').click(function() {
      var forumIds = [];
      var trackForumIds = [];
      $(".jsCategoryPersonalizationItem.is-selected").each(function(){
        forumIds.push($(this).attr("data-forumid"));
        trackForumIds.push('forum-' + $(this).attr("data-forumid"));
        dataLayer.push({
          'forumSubscriber': 1,
          'userID': $(this).attr("data-userid"),
          'forumId': $(this).attr("data-forumid"),
          'forumName': $(this).attr("data-forumname"),
          'forumParentId': $(this).attr("data-forumParentId"),
          'forumParentName': $(this).attr("data-forumParentName"),
          'channelId': $(this).attr("data-channelId"),
          'channelName': $(this).attr("data-channelName"),
        });
      });
       $.ajax({
        url: '/misc/subscribe_multiple_forum',
        type: 'post',
        data: {forumIds: forumIds},
        success: function (e, t) {
          var result = $.parseJSON(e);
          if (result.status == "ok") {
            dataLayer.push({
              'event': 'trackEvent',
              'eventDetails.category': 'feeds subscription',
              'eventDetails.action': 'subscribe',
              'eventDetails.label': trackForumIds.join(",")
            });
            location.reload();
          } else {
            window.location = '/user/login/forum';
          }
        },
        error: function(xhr) {
          window.location = '/user/login/forum';
        }
      });
    });
    $('#subscribedFeedLater').click(function() {
        dataLayer.push({
          'event': 'trackEvent',
          'eventDetails.category': 'feeds subscription',
          'eventDetails.action': 'skip',
          'eventDetails.label': ''
        });
       setFeedDisplay('all_feed');
    });
}

function bindSetjsButtonSubscribe() {
  $(".jsCategoryPersonalizationItem").click(function() {
    bindSetSubcategoryItem($(this));
  });
}

var community_list_loading_image = '<img src="' + assetsFolderNew + '/images/icon-load-biru.gif" width="40" height="40" alt="conection-loading" />';
function get_popular_forum_list() {
  $(".popular_community_list").addClass("Ta(c)");
  $(".popular_community_list").html(community_list_loading_image);
  let channel_id = $(".popular_community_list").attr("data-channel-id");
  let is_for_you = $(".popular_community_list").attr("data-channel-for-you");

  $.get(
    "/forum_misc/get_community_list/popular/" +
    channel_id + "/" + is_for_you,
    function (data) {
      $(".popular_community_list").removeClass("Ta(c)");
      $(".popular_community_list").html(data.popular_community_list);

    },
    "json"
  );
  
}

function get_newest_forum_list() {
  $(".newest_community_list").addClass("Ta(c)");
  $(".newest_community_list").html(community_list_loading_image);
  let channel_id = $(".newest_community_list").attr("data-channel-id");
  let is_for_you = $(".newest_community_list").attr("data-channel-for-you");

  $.get(
    "/forum_misc/get_community_list/newest/" +
    channel_id + "/" + is_for_you,
    function (data) {
      $(".newest_community_list").removeClass("Ta(c)");
      $(".newest_community_list").html(data.newest_community_list);
    },
    "json"
  );
}

function leaveNextStep(actionButton, modalElm){
  subscribeUnsubscribe($(actionButton[0]));
  closeModal(modalElm);
}

function confirmLeaveCommunity(elm) {
  let modalElm = elm.getAttribute("data-modal-id");
  let actionButton = $("body").find('button[data-modal="' + modalElm + '"]');
  leaveNextStep(actionButton, modalElm);
}


$(document).on("click", ".jsModalLoad", function () {
  if($(this).hasClass('jsModalTrigger')){  
  var modalTarget = $(this).attr("data-modal");
  var message = $(this).attr("data-leave-message");
  $(".jsModalSubscription").attr('id', modalTarget);
  $('.confirmModalButton').attr('data-modal-id', modalTarget);
  $('.confirmModalButton').attr('onclick', "confirmLeaveCommunity(this)");
  $(".leave_confirmation_message").html(message);
  }
});

// Spoiler
function spoiler(spoilerData) {
  if (spoilerData.value == "Show") {
    $(".content_" + $(spoilerData).attr("class")).slideDown(0);
    spoilerData.innerHTML = "";
    spoilerData.value = "Hide";
  } else {
    $(".content_" + $(spoilerData).attr("class")).slideUp(0);
    spoilerData.innerHTML = "";
    spoilerData.value = "Show";
  }
}

//get all smilies
function get_smilies() {
  localSmilies = get_MRU();

  if (localSmilies) {
    var mru_smilies = {
      smilies: $.param(localSmilies),
    };
  }

  $.ajax({
    method: "POST",
    url: "/misc/get_smilies",
    data: mru_smilies || {},
    success: function (result) {
      result = JSON.parse(result);
      smilies = JSON.parse(result.kaskus);

      $(".smilies-tab").replaceWith(smilies.tab);
      $(".smilies-tab-content").replaceWith(smilies.content);

      if (result.mru) {
        smilies_mru = result.mru;

        $("#content-mru").html(smilies_mru);

        // $('.smiley-tab > .nav-tabs > li[id^="group"]:first').removeClass('active');
        // $('#emoticons .tab-content > .tab-pane[id^="tab"]:first').removeClass('active');

        $("#mru").addClass("active");
        $("#content-mru").addClass("active");

        load_MRU();
      } else {
        $("#mru").hide();
        // $('.smiley-tab > .nav-tabs > li[id^="group"]:first').addClass('active');
        // $('#emoticons .tab-content > .tab-pane[id^="tab"]:first').addClass('active');
      }
      show_tab(".smiley-wrapper .smiley-tab .tab-content > .active");
      $(".smiley-tab__item")
        .not(".smiley-tab__item--unavailable")
        .find(".smilie__in-action")
        .click(function () {
          get_focus();
          smiley_tracking(this.children);
          insert_smilikiti(this.children);
        });
      $("#emoticons").show();
    },
  });
}

//Thread gk make si, tapi cari di backend gk ad yg pake please recheck
function printDiv(divId) {
  window.frames["print_frame"].document.body.innerHTML =
    document.getElementById(divId).innerHTML;
  window.frames["print_frame"].window.focus();
  window.frames["print_frame"].window.print();
}

//get most recent used smiley
function get_MRU() {
  var temp = [];

  if (localStorage[mru_key]) {
    mru = JSON.parse(localStorage[mru_key]);

    if (mru) {
      for (var a in mru) {
        if (a.search("smilie") > -1) {
          temp.push(mru[a]);
        }
      }
      var data = {
        smilies: temp,
      };
    }
  }

  return data || {};
}

//load most recent used smilies
function load_MRU() {
  var x = $("#content-mru").find(".loadMRU");

  if (x) {
    $.each(x, function (i, smilie) {
      $(smilie).attr(
        "src",
        $('.loadSmilies[alt="' + $(smilie).attr("alt") + '"]').attr("data-src")
      );
      $(smilie).attr(
        "title",
        $('.loadSmilies[alt="' + $(smilie).attr("alt") + '"]').attr("title")
      );
      $(smilie).removeAttr("class");
    });
  }

  return true;
}

//tab smilies
function show_tab(tab_number) {
  var x = $(tab_number).find(".loadSmilies");

  if (x) {
    $.each(x, function (i, smilie) {
      $(smilie).attr("src", $(smilie).attr("data-src"));
      $(smilie).removeAttr("data-src");
      $(smilie).removeAttr("class");
    });
  }

  return true;
}

//insert smilies
function insert_smilikiti(a) {
  if (localStorage) {
    var smilies = JSON.parse(localStorage.getItem(mru_key));

    if (smilies) {
      for (var b in smilies) {
        if (b === "smilie" + $(a).attr("alt")) {
          delete smilies[b];
        }
      }
    } else {
      var smilies = new Object();
    }

    if (mru_limit == Object.keys(smilies).length) {
      delete smilies[Object.keys(smilies)[0]];
    }

    smilies["smilie" + $(a).attr("alt")] = $(a).attr("alt");

    localStorage.setItem(mru_key, JSON.stringify(smilies));
  }
  (emoticon = $(a).attr("alt") + " "),
    $.markItUp({
      replaceWith: emoticon,
    });
  if ($.cookie("use_old_qnt") !== "1") {
    if (sceditorInstance.inSourceMode()) {
      sceditorInstance.insert($(a).attr("alt"));
    } else {
      sceditorInstance.insert(
        '<img src="' +
          $(a).attr("src") +
          '" data-sceditor-emoticon="' +
          $(a).attr("alt") +
          '" border="0" alt="emoticon-' +
          $(a).attr("title") +
          '" title="' +
          $(a).attr("title") +
          '">',
        null,
        false
      );
    }
  }
}

// Jump to page thread detail
function jump_page(e) {
  var t = $("#" + e).val();
  var n = $(".url_jump").val();
  window.location.href = n + t;
}

//click video gif
function clickVideo(el) {
  if ((" " + el.className + " ").indexOf(" playing ") > -1) {
    el.className = el.className.replace(/(?:^|\s)playing(?!\S)/g, "");
    var video = el.getElementsByTagName("video")[0];
    video.setAttribute("src", "");
    video.pause();
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }
  } else {
    el.className += " playing";
    var source = document.createElement("source");
    source.src = el.getAttribute("data-src");
    source.type = "video/mp4";
    el.getElementsByTagName("video")[0].setAttribute(
      "src",
      el.getAttribute("data-src")
    );
    el.getElementsByTagName("video")[0].appendChild(source);
    el.getElementsByTagName("video")[0].play();

    if (el.hasAttribute("data-threadid")) {
      listThreadId.push(el.getAttribute("data-threadid"));
      el.removeAttribute("data-threadid");
      updateView();
    }
  }
}

function showMe(box) {
  var chboxs = document.getElementsByName("timeout");
  var vis = "none";
  var timeout = 0;
  for (var i = 0; i < chboxs.length; i++) {
    if (chboxs[i].checked) {
      vis = "block";
      timeout = 1;
      break;
    }
  }
  $("input[name=timeout]").val(timeout);
  document.getElementById(box).style.display = vis;
}

function changeValueCreatedPoll(obj) {
  var value = $("input[name=created_poll]").val();
  $("input[name=created_poll]").val(1 - value);
}

function checkcreatedPoll() {
  if ($("input[name=created_poll]").val() == 1) {
    $(".sceditor-button-polling").addClass("active createdPoll");
  }
}

/*
  This Section Belongs to SCEditor Related Code in Create Thread
 */

if (document.getElementById("jsToolbarSCEditor") != null) {
  sceditor.formats.bbcode.remove("ol");
  sceditor.formats.bbcode.remove("li");
  sceditor.formats.bbcode.remove("ul");

  // Spoiler Button
  var spoilerTemplate =
    '<div class="spoiler sceditor-ignore"><span class="spoiler-head sceditor-ignore"><span class="spoiler-label">Spoiler</span>&nbsp;for <span class="spoiler-title">%title%</span>: <input type="button" value="Hide" class="spoiler-btn open" onclick="this.parentElement.parentElement.nextSibling.classList.toggle(\'open\');this.parentElement.parentElement.nextSibling.nextSibling.classList.toggle(\'open\');this.value=this.value==\'Hide\'?\'Show\':\'Hide\'"></span></div><div class="spoiler-mid sceditor-ignore"></div><div class="spoiler-content expandable open" data-title="%title%">%content%</div>';

  sceditor.formats.bbcode.set("spoiler", {
    tags: {
      div: {
        class: [
          "spoiler-content expandable open",
          "spoiler-content expandable",
        ],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      var spoilerTitle = $(element).data("title") || "spoiler";
      return "[spoiler=" + spoilerTitle + "]" + content + "[/spoiler]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      var spoilerTitle = attr.defaultattr.replace(/"/g, "&quot;");
      var result = spoilerTemplate
        .replace(/%title%/g, spoilerTitle)
        .replace(/%content%/g, content);
      return result;
    },
    isInline: false,
    quoteType: sceditor.BBCodeParser.QuoteType.never,
  });

  sceditor.command.set("spoiler", {
    exec: function () {
      create_spoiler(this);
    },
    txtExec: function () {
      create_spoiler(this);
    },
    tooltip: "Masukkan Spoiler",
  });

  function create_spoiler(sceInstance) {
    swal("Masukkan Judul Spoiler:", {
      content: "input",
    }).then((value) => {
      if (value !== null) {
        if (!$(".sceditor-button-source").hasClass("active")) {
          value = value.replace(/"/g, "&quot;") || "spoiler";
        }
        sceInstance.insert("[spoiler=" + value + "]", "[/spoiler]");
      }
    });
  }

  sceditor.formats.bbcode.set("img", {
    allowsEmpty: true,
    tags: {
      img: {
        src: null,
      },
      video: {
        class: ["c-giphy__preview"],
      },
    },
    allowedChildren: ["#"],
    quoteType: sceditor.BBCodeParser.QuoteType.never,
    format: function (element, content) {
      if ($(element).attr("data-sceditor-emoticon")) {
        return content;
      }
      var link = $(element).attr("src")
        ? $(element).attr("src")
        : $(element).attr("data-src");
      var matches = link.split(new RegExp("(.+giphy.com.+)/.+.mp4$"));

      link = matches[1] ? matches[1] + "/giphy.gif" : link;

      return "[img]" + link + "[/img]";
    },
    html: function (token, attrs, content) {
      var matches = content.split(new RegExp("(.+giphy.com.+)/.+.gif$"));

      if (matches[1]) {
        content = matches[1] + "/giphy-downsized-small.mp4";
        return (
          '<video class="c-giphy__preview" autoplay loop data-src="' +
          sceditor.escapeUriScheme(content) +
          '"> <source src="' +
          sceditor.escapeUriScheme(content) +
          '" type="video/mp4"> </video>'
        );
      }

      return (
        '<img style="max-width:100%" src="' +
        sceditor.escapeUriScheme(content) +
        '" />'
      );
    },
  });
  // END_COMMAND

  // Quote Button

  var quoteTemplate =
    '<div class="sceditor-ignore quote-mark">Quote:</div>\
  <div class="quote expandable" data-by="%quotedBy%" data-postid="%quotedPostId%">%cite%%content%</blockquote></div>';

  sceditor.formats.bbcode.set("quote", {
    tags: {
      div: {
        class: ["quote expandable"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      var by = $(element).data("by");
      var postId = $(element).data("postid");
      var param = "";
      if (by !== "" && postId !== "") {
        param = "=" + by + ";" + postId;
      }
      return "[quote" + param + "]" + content + "[/quote]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      var cite = "";
      var quotedBy = "";
      var quotedPostId = "";
      if (attr.defaultattr) {
        var seg = attr.defaultattr.split(";");
        quotedBy = seg[0];
        if (quotedBy) {
          quotedPostId = seg[1] || "";
          cite =
            '<cite class="sceditor-ignore">Original Posted By <b>' +
            quotedBy +
            "</b> ";
          cite +=
            '<a href="/post/' +
            quotedPostId +
            "#post" +
            quotedPostId +
            '">►</a></cite>';
        }
      }
      var result = quoteTemplate
        .replace(/%quotedBy%/g, quotedBy)
        .replace(/%quotedPostId%/g, quotedPostId)
        .replace(/%cite%/g, cite)
        .replace(/%content%/g, content);
      return result;
    },
    isInline: false,
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  sceditor.command.set("quote", {
    exec: function () {
      this.insert("[quote]", "[/quote]");
    },
    txtExec: function () {
      this.insert("[quote]", "[/quote]");
    },
    tooltip: "Masukkan Quote",
  });

  // Smilies Button

  sceditor.command.set("smilies", {
    exec: function () {
      toggleSmilies();
    },
    txtExec: function () {
      toggleSmilies();
    },
    tooltip: "Masukkan Smilies",
  });

  function toggleSmilies() {
    if (
      $(".jsExtraForm:visible").length == 1 &&
      $(".jsSmiliesEditor:visible").length == 0
    ) {
      $(".jsExtraForm").hide();
      $(
        ".sceditor-button-polling.active, .sceditor-button-media.active, .sceditor-button-smilies.active"
      ).removeClass("active");
    }
    if ($(".jsSmiliesEditor:visible").length == 0) {
      $(".jsSmiliesEditor").show();
      $(".sceditor-button-smilies").addClass("active");
      //var scrollTo = $("#jsToolbarSCEditor").offset().top - ($(window).height() - $('.jsSmiliesEditor').outerHeight(true) - $('#jsToolbarSCEditor').outerHeight(true)) + 50;
    } else {
      $(".jsSmiliesEditor").hide();
      $(".sceditor-button-smilies").removeClass("active");
      //var scrollTo = $("#jsToolbarSCEditor").offset().top - ($(window).height() - $('#jsToolbarSCEditor').outerHeight(true)) + 50;
    }
    $(".jsMentionContainer").remove();
    $(".sceditor-button-mention").removeClass("active");
    // $('html, body').animate({
    //   scrollTop: scrollTo
    // }, 500);
  }

  // Polling Button

  sceditor.command.set("polling", {
    exec: function () {
      togglePolling();
    },
    txtExec: function () {
      togglePolling();
    },
    tooltip: "Buat Poll",
  });

  function togglePolling() {
    // if($('.jsExtraForm:visible').length == 1 && $('.jsPollingForm:visible').length == 0){
    //   $('.jsExtraForm').hide();
    //   $('.sceditor-button-polling.active, .sceditor-button-media.active, .sceditor-button-smilies.active').removeClass('active');
    // }
    if ($(".jsPollingForm:visible").length == 0) {
      $(".jsPollingForm").slideDown();
      $(".sceditor-button-polling").addClass("active createdPoll");
      //var scrollTo = $("#jsToolbarSCEditor").offset().top - ($(window).height() - $('.jsPollingForm').outerHeight(true) - $('#jsToolbarSCEditor').outerHeight(true)) + 50;
      var scrollTo = $(".jsExtraFormContainer").offset().top;
    } else {
      swal({
        text: "Poll akan dihapus. Yakin?",
        icon: "warning",
        buttons: ["Batal", "Hapus"],
        dangerMode: true,
      }).then((akanHapus) => {
        if (akanHapus) {
          $(".jsPollingForm").slideUp();
          $(".sceditor-button-polling").removeClass("active createdPoll");
          var scrollTo = $("#jsToolbarSCEditor").offset().top;
          $("html, body").animate(
            {
              scrollTop: scrollTo,
            },
            400
          );
        }
      });
    }
    $("html, body").animate(
      {
        scrollTop: scrollTo,
      },
      400
    );
  }

  // Link Button
  sceditor.command.set("link", {
    exec: function () {
      insertLink(this);
    },
    txtExec: function () {
      insertLink(this);
    },
    tooltip: "Masukkan Link",
  });

  function insertLink(sceInstance) {
    var selectedText = sceInstance.toBBCode(
      sceInstance.getRangeHelper().selectedHtml().toString()
    );
    var el =
      `<div class="Ta(s)">\
        <div class="Fz(16px) Mb(10px)">URL:</div>\
        <input class="swal-content__input" id="jsLinkInputUrl" placeholder="http://">\
        <div class="Fz(16px) My(10px)">Text to display:</div>\
        <input value="` +
      selectedText +
      `" class="swal-content__input" id="jsLinkMediaInputText" placeholder="Link Url">\
      </div>`;
    var elNode = $.parseHTML(el);
    swal({
      content: elNode[0],
      buttons: {
        confirm: {
          value: "",
        },
      },
    }).then((value) => {
      var linkInput = $("#jsLinkInputUrl").val();
      var linkText = $("#jsLinkMediaInputText").val();

      sceInstance.insert("[url=" + linkInput + "]" + linkText + "[/url]");
    });
  }
  $(document).on("click", ".jsDivCounter", function () {
    sceditorInstance.focus();
    var rangeHelper = sceditorInstance.getRangeHelper();
    var range = rangeHelper.cloneSelected();

    // Handle DOM ranges, if you casre about IE < 9
    // you'll need to handle TextRanges too
    if ("selectNodeContents" in range) {
      var bodyChildren = sceditorInstance.getBody().children;

      // Select the last child of the body
      range.selectNodeContents(bodyChildren[bodyChildren.length - 1]);

      // Move cursor to after it
      range.collapse(false);
      rangeHelper.selectRange(range);
    }
  });

  // Media Button
  $(document).on("click", ".jsEmbedMediaButton", function () {
    var el = `<div>\
      <input class="swal-content__input" id="jsEmbedMediaInputUrl" placeholder="Link Url">\
    </div>\
    <div class="Ta(c)">\
      <div class="My(15px)">Supported Media</div>\
      <div>\
        <i title="Youtube" class="fab fa-youtube"></i>\
        <i title="Vimeo" class="fab fa-vimeo-square"></i>\
        <i title="Soundcloud" class="fab fa-soundcloud"></i>\
        <i title="Twitch" class="fab fa-twitch"></i>\
        <i title="Facebook Video" class="icon icon-facebook-video"></i>\
        <i title="Dailymotion" class="icon icon-daily-motion"></i>\
        <i title="Smule" class="icon icon-smule"></i>\
      </div>\
    </div>`;
    var elNode = $.parseHTML(el);
    swal({
      text: "Masukkan URL Embed:",
      content: elNode[0],
      buttons: {
        confirm: {
          value: "",
        },
      },
    }).then((value) => {
      var urlEmbed = document.getElementById("jsEmbedMediaInputUrl").value;
      inserEmbedMedia(sceditor.instance(textareaSCeditor), urlEmbed);
    });
  });

  // Mention Button
  sceditor.command.set("mention", {
    exec: function () {
      toggleMention(this);
    },
    txtExec: function () {
      toggleMention(this);
    },
    tooltip: "Buat Mention",
  });

  var mentionToolbar = `<div style=\"right: -86px;bottom: 43px;\" class=\"jsMentionSCEditor jsMentionContainer W(205px) Pos(a) Z(1) B(25px) \">\
    <div class=\"W(15px) H(15px) Bgr(nr) Bgz(ct) Bgp(c) Bgi(bgTriangleGrey) Pos(a) Start(8px) B(-11px) Rotate(180deg)\"></div>\
    <div class=\"Bd(borderSolidLightGrey) Bxsh(boxShadow)\">\
      <div class=\"D(f) Pos(r) Bdb(borderSolidLightGrey)\">\
        <input type=\"text\" class=\"W(100%) autocomplete-mention Bd(none) Fz(14px) C(c-normal) Py(15px) Pstart(35px) Pend(15px)\" placeholder=\"Cari username\"/>\
        <i class=\"Pos(a) T(17px) Start(15px) fas fa-search C(c-grey)\"></i>\
      </div>\
      <ul class=\"Bgc(c-white) mentionList\">\
      </ul>\
    </div>\
  </div>\
`;

  function toggleMention(sceInstance) {
    $(".jsExtraForm").hide();
    $(
      ".sceditor-button-polling.active, .sceditor-button-media.active, .sceditor-button-smilies.active"
    ).removeClass("active");

    if ($(".jsMentionContainer").length == 0) {
      $(mentionToolbar).appendTo("#jsToolbarSCEditor");
      $(".sceditor-button-mention").addClass("active");
      $(".jsMentionContainer input").focus();
      //var scrollTo = $("#jsToolbarSCEditor").offset().top - ($(window).height() - $('.jsEmbedMediaForm').outerHeight(true) - $('#jsToolbarSCEditor').outerHeight(true)) + 50;
    } else {
      $(".jsMentionContainer").remove();
      $(".sceditor-button-mention").removeClass("active");
      //var scrollTo = $("#jsToolbarSCEditor").offset().top - ($(window).height() - $('#jsToolbarSCEditor').outerHeight(true)) + 50;
    }
    // var selectedText = sceInstance.toBBCode(sceInstance.getRangeHelper().selectedHtml().toString());
    // if(selectedText != ""){
    //   alert("jon");
    // }
    // else{
    //   sceInstance.insert('@');
    //   sceInstance.blur();
    //   sceInstance.focus();
    //   $(sceditorInstance.getBody()).click();
    // }
  }

  $(document).on("click", function (event) {
    if (
      !$(event.target).closest(".sceditor-button-mention, .jsMentionSCEditor ")
        .length
    ) {
      if ($(".jsMentionSCEditor").length) {
        $(".jsMentionSCEditor").remove();
        $(".sceditor-button-mention").removeClass("active");
      }
    }
  });

  var mentionTemplate =
    '<a class="mention" href="' + KASKUS_URL + '/@{username}">@{username}</a>';
  sceditor.formats.bbcode.set("mention", {
    tags: {
      a: {
        class: ["mention"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      var username = String($(element).attr("href")).split("@");
      return "[mention]" + username[1] + "[/mention]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      return mentionTemplate.replace(/\{username\}/gi, content);
    },
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  // Youtube
  var youtubeTemplate =
    '<div class="sceditor-ignore youtube-player" onclick="this.nextElementSibling.style.display=\'block\'; this.style.display=\'none\';\
  this.nextElementSibling.src =\'https://www.youtube.com/embed/{id}?autoplay=1\'">\
  <div class="sceditor-ignore"><div class="icon" style="background-image:url(https://img.youtube.com/vi/{id}/0.jpg);padding-bottom:56.25%; width:100%; height: 0; background-size: cover; background-position:center; max-width: 100%"></div>\
  </div></div>\
  <iframe data-id="{id}" class="youtube-iframe" style="display:none" type="text/html" width="100%" height="350" frameborder="0"></iframe>';
  var youtubeId;

  function getYoutubeId(url) {
    var regExp =
      /(^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?|^)([^#\&\?]*).*/;
    var match = url.match(regExp);

    return match && match[8].length === 11 ? match[8] : false;
  }

  sceditor.formats.bbcode.set("youtube", {
    tags: {
      iframe: {
        class: ["youtube-iframe"],
      },
    },
    allowsEmpty: false,
    breakAfter: true,
    format: function (element, content) {
      // html2bbcode
      return "[youtube]" + $(element).data("id") + "[/youtube]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      if ((youtubeId = getYoutubeId(content)))
        return youtubeTemplate.replace(/\{id\}/gi, youtubeId);
      else return "";
    },
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  var twitterTemplate =
    '<div class="sceditor-ignore" style="margin:0 auto;">\
							<div style="position: relative;margin-top: 15px;margin-bottom: 15px;text-align: center">\
								<img style="width: 480px" src="' +
    assetsFolderNew +
    '/images/image-placeholder-twitter.gif">\
							</div>\
						</div>\
						<div class="embed_twitter"  data-url="https://twitter.com/{user}/status/{id}"></div> ';

  sceditor.formats.bbcode.set("twitter", {
    tags: {
      div: {
        class: ["embed_twitter"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      var reg = new RegExp(
        /(?:http(?:s)?:\/\/)?(?:www\.)?twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/
      );
      var match = reg.exec($(element).data("url"));
      if (match !== null) {
        return '[twitter="' + match[1] + '"]' + match[3] + "[/twitter]";
      } else return "";
    },
    html: function (token, attr, content) {
      // bbcode2html
      return twitterTemplate
        .replace(/\{id\}/gi, content)
        .replace(/\{user\}/gi, attr.defaultattr);
    },
    breakAfter: true,
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  var instagramTemplate =
    '<div class="sceditor-ignore wrapperEmbedIg" style="position:relative; margin:15px auto; max-width:480px; text-align:center;"><img style="width:480px;" src="' +
    assetsFolderNew +
    '/images/image-placeholder-ig.gif"><div style="position:absolute; top:72px; left:0; width:100%; height:100%; z-index:5;"></div></div><div class="embed_instagram" data-url="{url}" data-code="{code}"></div> ';

  sceditor.formats.bbcode.set("instagram", {
    tags: {
      div: {
        class: ["embed_instagram"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      return "[instagram]" + $(element).data("url") + "[/instagram]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      if ((instagramCode = getInstagramCode(content)))
        return instagramTemplate
          .replace(/\{url\}/gi, content)
          .replace(/\{code\}/gi, instagramCode);
      else return "";
    },
    breakAfter: true,
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  function getInstagramCode(url) {
    var regExp =
      /((?:(?:(?:(?:https?)(?::\/\/))?(?:www\.?)?)?)(?:instagram\.com|instagr\.am)\/?([a-zA-Z0-9_.]{1,30})?\/p\/([A-Za-z0-9_\-]+)\/?)/;
    var match = url.match(regExp);
    return match ? match[3] : false;
  }

  // Vimeo
  var vimeoTemplate =
    '<iframe class="vimeo-player" data-id="{id}" src="https://player.vimeo.com/video/{id}?title=0&byline=0&portrait=0" \
  width="520" height="300" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
  var vimeoId;

  sceditor.formats.bbcode.set("vimeo", {
    tags: {
      iframe: {
        class: ["vimeo-player"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      return "[vimeo]" + $(element).data("id") + "[/vimeo]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      if ((vimeoId = getVimeoId(content)))
        return vimeoTemplate.replace(/\{id\}/gi, vimeoId);
      else return "";
    },
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  function getVimeoId(url) {
    var regExp = /(vimeo\.com\/|^)(\d+)/;
    var match = url.match(regExp);
    return match ? match[2] : false;
  }

  // KASKUS Video
  sceditor.formats.bbcode.set("kaskus_video", {
    tags: {
      iframe: {
        class: ["kaskus_video"],
      },
      div: {
        class: ["kaskus_video"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      return "[kaskus_video]" + $(element).data("id") + "[/kaskus_video]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      var videoId = content.match(/[0-9a-z]{1,}/)[0];
      var isKVPVideo = videoId.length == 5;
      if (isKVPVideo) {
        return (
          '<iframe class="kaskus_video" data-id="' +
          videoId +
          '" style="display: block;" width="95%" height="350" frameborder="0" src="' +
          KASKUSTV_URL +
          "/api/embed/video/" +
          videoId +
          '"></iframe>'
        );
      }
      return (
        '<iframe class="kaskus_video" data-id="' +
        videoId +
        '" style="display: block;" width="95%" height="350" frameborder="0" src="' +
        KASKUS_URL +
        "/embed/" +
        videoId +
        '"></iframe>'
      );
    },

    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  function getKaskusVideoId(url) {
    var regExp = /[0-9a-f]{24}/;
    var match = url.match(regExp);
    return match ? match[1] : false;
  }

  //VIDEO
  sceditor.formats.bbcode.set("video", {
    tags: {
      a: {
        class: ["toggle-play"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      return "[video]" + $(element).find("source").attr("src") + "[/video]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      var video_tag =
        '<video preload="auto" poster="' +
        content +
        '.png" loop="" muted="" title="" width="100%"><source src="' +
        content +
        '" type="video/mp4"></video>';

      return (
        '\
  			<a class="toggle-play" href="' +
        content +
        '" data-src="' +
        content +
        '" onclick="clickVideo(this);return false;">\
  				' +
        video_tag +
        '\
  				<span>\
  					<span class="empty-space"></span>\
  					<span class="gif-space">GIF</span>\
  				</span>\
  			</a>'
      );
      // return '<video class="upload_video" preload="auto" poster="' + content + '.png" loop="" muted="" title="" width="100%"><source src="' + content + '" type="video/mp4"></video>';
    },

    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  // Twitch

  var twitchTemplate =
    '<div class="sceditor-ignore twitch-player" onclick="this.nextElementSibling.style.display=\'block\'; this.style.display=\'none\';this.nextElementSibling.src =\'/embed/video/{type}/{id}\'" style="max-width: 100%;margin: 0 auto;display:inline-block;">\
  <div class="sceditor-ignore" style="position:relative;cursor:pointer;display:inline-block; overflow: hidden;">\
  <img src="/embed/thumbnail_video_third_party/{type}/{id}" style="max-width: 100%" alt="{thread_title}" />\
  <i></i></div></div>\
  <iframe data-type="{type}" data-id="{id}"  class="twitch-iframe" style="display:none" type="text/html" width="100%" height="350" frameborder="0"></iframe>';
  sceditor.formats.bbcode.set("twitch", {
    tags: {
      iframe: {
        class: ["twitch-iframe"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      return (
        '[twitch="' +
        $(element).data("type") +
        '"]' +
        $(element).data("id") +
        "[/twitch]"
      );
    },
    html: function (token, attr, content) {
      // bbcode2html
      return twitchTemplate
        .replace(/\{id\}/gi, content)
        .replace(/\{type\}/gi, attr.defaultattr);
    },
    breakAfter: true,
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  function getTwitchId(url) {
    var regexExp = new RegExp(
      /(?:https?:\/\/)?(?:(.*?)(?:\.)?)twitch\.tv\/((?:(videos)\/)|\?.*(?:(?:(clip|channel)=)|(?:(video)=v?))|(?:(?:embed\?.*?clip=)))?(.*?)(\]|\[|&|$)/g
    );
    var match = regexExp.exec(url);
    if (match === null) {
      return false;
    }
    var result = [];
    result["id"] = match[6];
    if (match[1] == "clips") {
      result["type"] = "twitch_clip";
    } else if (match[3] && match[6]) {
      result["type"] = "twitch_video";
    } else {
      result["type"] = "twitch_channel";
    }
    return result;
  }

  // Facebook Video

  var fbvideoTemplate =
    '<iframe id="fb-video" data-user="{user}" data-id="{id}" src="https://www.kaskus.co.id/embed/facebook/{user}/{id}" class="fb_video{id}" frameborder="0" allowfullscreen height="450px" width="100%" scrolling="no" onload="function resizeIframeFBBody(e){try{var t=JSON.parse(e.data); if( \'fb_video\' == t.type ){var vel = document.getElementsByClassName(\'fb_video\'+t.id); for(var v = 0; v < vel.length; v ++){if(vel[v].className.indexOf(\'resized\') > -1) continue; vel[v].className += \' resized\';vel[v].setAttribute(\'height\', t.height); if(t.width !== undefined){ vel[v].setAttribute(\'width\', t.width); };};};}catch(e){}}window.addEventListener(\'message\',resizeIframeFBBody,!1);"></iframe>';

  sceditor.formats.bbcode.set("fb_video", {
    tags: {
      iframe: {
        id: ["fb-video"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      return (
        '[fb_video="' +
        $(element).data("user") +
        '"]' +
        $(element).data("id") +
        "[/fb_video]"
      );
    },
    html: function (token, attr, content) {
      // bbcode2html
      return fbvideoTemplate
        .replace(/\{id\}/gi, content)
        .replace(/\{user\}/gi, attr.defaultattr);
    },
    breakAfter: true,
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  function getFbvideoId(url) {
    var regexExp = new RegExp(
      /http(?:s?):\/\/(?:www\.|web\.|m\.)?facebook\.com\/([A-z0-9\.]+)\/videos(?:\/[0-9A-z].+)?\/(\d+)(?:.+)?$/g
    );
    var match = regexExp.exec(url);
    if (match === null) {
      return false;
    }
    var result = [];
    result["user"] = match[1];
    result["id"] = match[2];
    return result;
  }

  // Soundcloud

  var soundcloudTemplate =
    '<iframe class="soundcloud-player" data-id="{id}" width="100%" height="166" scrolling="no" frameborder="no" \
  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{id}&color=1484ce&auto_play=false"></iframe>';
  var soundcloudId;

  sceditor.formats.bbcode.set("soundcloud", {
    tags: {
      iframe: {
        class: ["soundcloud-player"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      return "[soundcloud]" + $(element).data("id") + "[/soundcloud]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      if ((soundcloudId = getSoundCloudId(content)))
        return soundcloudTemplate.replace(/\{id\}/gi, soundcloudId);
      else return "";
    },
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  function getSoundCloudId(url) {
    var regExp = /(tracks\/|^)(\d+)/;
    var match = url.match(regExp);
    return match ? match[2] : false;
  }

  // Dailymotion

  var dailymotionTemplate =
    '<div class="dailymotion-wrapper sceditor-ignore" onclick="this.nextElementSibling.style.display=\'block\';\
  this.style.display=\'none\';this.nextElementSibling.src =\'//www.dailymotion.com/embed/video/{id}?autoplay=1\'"><div>\
  <img src="https://www.dailymotion.com/thumbnail/video/{id}" alt="{thread_title}" /><i></i></div></div>\
  <iframe class="dailymotion-iframe" style="display:none" data-id="{id}" type="text/html" width="100%" height="350" frameborder="0"></iframe>';
  var dailymotionId;

  sceditor.formats.bbcode.set("dailymotion", {
    tags: {
      iframe: {
        class: ["dailymotion-iframe"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      return "[dailymotion]" + $(element).data("id") + "[/dailymotion]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      if ((dailymotionId = getDailymotionId(content)))
        return dailymotionTemplate.replace(/\{id\}/gi, dailymotionId);
      else return "";
    },
    breakAfter: true,
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  function getDailymotionId(url) {
    var regExp =
      /(?:(?:(?:dailymotion\.com(?:\/video|\/hub)|dai\.ly))\/([0-9a-z]+)(?:[\-_0-9a-zA-Z]+#video=(?:[a-z0-9]+))?|(^[0-9a-z]+$))/i;
    var match = url.match(regExp);
    return match ? match[1] || match[2] : false;
  }

  // Smule
  var smuleTemplate =
    '<iframe class="smule-player" data-id="{id}" frameborder="0" width="100%" height="125" \
  src="https://www.smule.com/recording/preview/{id}/frame" scrolling="no"></iframe>';
  var smuleId;

  sceditor.formats.bbcode.set("smule", {
    tags: {
      iframe: {
        class: ["smule-player"],
      },
    },
    allowsEmpty: true,
    format: function (element, content) {
      // html2bbcode
      return "[smule]" + $(element).data("id") + "[/smule]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      if ((smuleId = getSmuleId(content)))
        return smuleTemplate.replace(/\{id\}/gi, smuleId);
      else return "";
    },

    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  function getSmuleId(url) {
    var regExp = /(\d+_\d+)/i;
    var match = url.match(regExp);
    return match ? match[1] : false;
  }

  //KaskusTV VOD
  var kaskusTvVodTemplate =
    '<div class="sceditor-ignore" onclick="this.nextSibling.style.display=\'block\'; this.style.display=\'none\';this.nextSibling.src =\'//tv.kaskus.co.id/api/embed/live/{id}?autoplay&player_medium=kaskus-thread\'" style="max-width: 100%;margin: 0 auto;display:inline-block;">\
  <div style="position:relative;cursor:pointer;display:inline-block">\
  <img src="//tv.kaskus.co.id/api/video/{id}/thumbnail" width="700" height="350" style="max-width:100%" alt="{thread_title}" />\
  <i style="background: url(//s.kaskus.id/img/icon/player-yt-icon.png) center center no-repeat;height: 41px;left: 50%;margin: -20px 0 0 -30px;position:absolute;top: 50%;width: 60px;-moz-border-radius: 5px;opacity: 0.8;"></i>\
  </div>\
  </div><iframe data-id="{id}" class="kaskustv-vod-iframe" style="display:none" type="text/html" width="100%" height="350" frameborder="0"/></iframe>';

  sceditor.formats.bbcode.set("kaskustv", {
    tags: {
      iframe: {
        class: ["kaskustv-vod-iframe"],
      },
    },
    allowsEmpty: false,
    breakAfter: true,
    format: function (element, content) {
      // html2bbcode
      return "[kaskustv]" + $(element).data("id") + "[/kaskustv]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      return kaskusTvVodTemplate.replace(/\{id\}/gi, content);
    },
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  //KASKUSTV Live
  var KaskusTvLivetemplate =
    '<div class="sceditor-ignore" onclick="this.nextSibling.style.display=\'block\'; this.style.display=\'none\';this.nextSibling.src =\'//tv.kaskus.co.id/api/embed/live/{id}?autoplay&player_medium=kaskus-thread\'" style="max-width: 100%;margin: 0 auto;display:inline-block;">\
  <div style="position:relative;cursor:pointer;display:inline-block">\
  <img src="//tv.kaskus.co.id/api/live/{id}/thumbnail" width="700" height="350" style="max-width:100%" alt="{thread_title}" />\
  <i style="background: url(//s.kaskus.id/img/icon/player-yt-icon.png) center center no-repeat;height: 41px;left: 50%;margin: -20px 0 0 -30px;position:absolute;top: 50%;width: 60px;-moz-border-radius: 5px;opacity: 0.8;"></i>\
  </div>\
  </div><iframe  data-id="{id}" class="kaskustv-live-iframe" style="display:none" type="text/html" width="100%" height="350" frameborder="0"/></iframe>';
  sceditor.formats.bbcode.set("kaskustv_live", {
    tags: {
      iframe: {
        class: ["kaskustv-live-iframe"],
      },
    },
    allowsEmpty: false,
    breakAfter: true,
    format: function (element, content) {
      // html2bbcode
      return "[kaskustv_live]" + $(element).data("id") + "[/kaskustv_live]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      return KaskusTvLivetemplate.replace(/\{id\}/gi, content);
    },
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  //KASKUS LIVE
  var KaskusLiveTemplate =
    '<iframe src="//live.kaskus.co.id/thread/info/{id}" data-id="{id}" class="livethread_iframe" width="100%" height="350px" frameborder="0"></iframe>';
  sceditor.formats.bbcode.set("kaskus_live", {
    tags: {
      iframe: {
        class: ["livethread_iframe"],
      },
    },
    allowsEmpty: false,
    breakAfter: true,
    format: function (element, content) {
      // html2bbcode
      return "[livethread]" + $(element).data("id") + "[/livethread]";
    },
    html: function (token, attr, content) {
      // bbcode2html
      return KaskusLiveTemplate.replace(/\{id\}/gi, content);
    },
    quoteType: sceditor.BBCodeParser.QuoteType.auto,
  });

  sceditor.command.set("media", {
    exec: function () {
      toggleMedia();
    },
    txtExec: function () {
      toggleMedia();
    },
    tooltip: "Masukkan Media",
  });

  function toggleMedia() {
    if (
      $(".jsExtraForm:visible").length == 1 &&
      $(".jsEmbedMediaForm:visible").length == 0
    ) {
      $(".jsExtraForm").hide();
      $(
        ".sceditor-button-polling.active, .sceditor-button-media.active, .sceditor-button-smilies.active"
      ).removeClass("active");
    }
    if ($(".jsEmbedMediaForm:visible").length == 0) {
      $(".jsEmbedMediaForm").show();
      $(".sceditor-button-media").addClass("active");
      //var scrollTo = $("#jsToolbarSCEditor").offset().top - ($(window).height() - $('.jsEmbedMediaForm').outerHeight(true) - $('#jsToolbarSCEditor').outerHeight(true)) + 50;
    } else {
      $(".jsEmbedMediaForm").hide();
      $(".sceditor-button-media").removeClass("active");
      //var scrollTo = $("#jsToolbarSCEditor").offset().top - ($(window).height() - $('#jsToolbarSCEditor').outerHeight(true)) + 50;
    }
    $(".jsMentionContainer").remove();
    $(".sceditor-button-mention").removeClass("active");
    // $('html, body').animate({
    //   scrollTop: scrollTo
    // }, 500);
  }

  function inserEmbedMedia(sceditor, url) {
    var template;
    var embedMediaId;

    if (getYoutubeId(url)) {
      embedMediaId = getYoutubeId(url);
      sceditor.insert("[youtube]" + embedMediaId + "[/youtube]");
    } else if (getFbvideoId(url)) {
      embedMediaId = getFbvideoId(url);
      sceditor.insert(
        '[fb_video="' +
          embedMediaId["user"] +
          '"]' +
          embedMediaId["id"] +
          "[/fb_video]"
      );
    } else if (getVimeoId(url)) {
      embedMediaId = getVimeoId(url);
      sceditor.insert("[vimeo]" + embedMediaId + "[/vimeo]");
    } else if (getTwitchId(url)) {
      embedMediaId = getVimeoId(url);
      sceditor.insert("[twitch]" + embedMediaId["id"] + "[/twitch]");
    } else if (getSoundCloudId(url)) {
      embedMediaId = getSoundCloudId(url);
      sceditor.insert("[soundcloud]" + embedMediaId + "[/soundcloud]");
    } else if (getDailymotionId(url)) {
      embedMediaId = getDailymotionId(url);
      sceditor.insert("[dailymotion]" + embedMediaId + "[/dailymotion]");
    } else if (getKaskusVideoId(url)) {
      embedMediaId = getKaskusVideoId(url);
      sceditor.insert("[kaskus_video]" + embedMediaId + "[/kaskus_video]");
    } else {
      swal("Tidaaaak!", "Link URL yang Agan Masukkan Salah!", "error");
    }
  }

  $(document).on("click", ".jsButtonValidate", function (e) {
    $(".sceditor-button-validate div").click();
  });

  $(document).on("click", ".jsButtonBBCode", function (e) {
    $(".sceditor-button-source div").click();
    if (sceditorInstance.val() != "") {
      $(sceditorInstance.getBody()).removeClass("placeholder");
    }
    if ($(".sceditor-button-source").hasClass("active")) {
      $(".jsButtonBBCode").addClass("is-active");
    } else {
      $(".jsButtonBBCode").removeClass("is-active");
    }
    if ($(".sceditor-button-validate").hasClass("disabled")) {
      $(".jsButtonValidate").addClass("is-disabled");
      $(".jsButtonValidate").prop("disabled", true);
    } else {
      $(".jsButtonValidate").removeClass("is-disabled");
      $(".jsButtonValidate").prop("disabled", false);
    }
    var target = $(e.currentTarget);
    var textarea_bbcode = $(".sceditor-container textarea");
    if (target.hasClass("active")) {
      textarea_bbcode.css({
        "padding-top": "20px",
        "padding-left": "10px",
      });
      textarea_bbcode.width(textarea_bbcode.parent("div").width() - 10);
      setTimeout(function () {
        textarea_bbcode.css("height", "1px");
        textarea_bbcode.css(
          "height",
          textarea_bbcode.prop("scrollHeight") + "px"
        );
      }, 100);
    } else {
      textarea_bbcode.css({
        padding: "0px",
      });
      var added = sceditorInstance.val().trimRight();
      if (added !== "") {
        sceditorInstance.val(added + "\n");
      }
      push_validate();
      setTimeout(function () {
        sceditorInstance.expandToContent();
      }, 1000);
    }
  });

  // VALIDATE
  sceditor.command.set("validate", {
    exec: function () {
      push_validate();
    },
    tooltip: "Validasi",
  });

  function push_validate() {
    sceditorInstance.readOnly(true);
    $.ajax({
      type: "POST",
      url: "/misc/preview_post_ajax/1",
      dataType: "json",
      data: {
        title: $("#form-title").val(),
        forum_id: $("#forum_id").val(),
        icon_id: parseInt($("input[name=iconid]:checked").val()),
        message: sceditorInstance.val(),
        parseurl: 1,
      },
      success: function (resp) {
        var content = resp.message.replace(
          /( <br \/>\n|<br \/>\n<br \/>\n)/g,
          "<div></div>"
        );
        content = content.replace(
          /class="mls-img" src=".*?" data-src="(.*?)"/g,
          'src="$1"'
        );
        content = content.replace(/class="spoiler"/g, 'class="spoiler open"');
        content = content + "<div><br></div>";
        sceditorInstance.setWysiwygEditorValue(content);
        sceditorInstance.readOnly(false);
        setTimeout(function () {
          sceditorInstance.expandToContent();
        }, 100);
      },
      error: function (xhr) {
        swal("Gagal ngecek, Gan!", "Silakan dicoba kembali!", "error");
        sceditorInstance.readOnly(false);
      },
    });
  }

  // prefetch iconHover
  var pic = new Image();
  var pic2 = new Image();
  var pic3 = new Image();
  var pic4 = new Image();
  var pic5 = new Image();
  var pic6 = new Image();
  var pic7 = new Image();
  var pic8 = new Image();
  var pic9 = new Image();
  var pic10 = new Image();
  var pic11 = new Image();
  var pic12 = new Image();
  var pic13 = new Image();
  pic.src = assetsImageLocation + "ic-editor-bold-blue.svg";
  pic2.src = assetsImageLocation + "ic-editor-italic-blue.svg";
  pic3.src = assetsImageLocation + "ic-editor-underline-blue.svg";
  pic4.src = assetsImageLocation + "ic-editor-align-left-blue.svg";
  pic5.src = assetsImageLocation + "ic-editor-align-center-blue.svg";
  pic6.src = assetsImageLocation + "ic-editor-align-right-blue.svg";
  pic7.src = assetsImageLocation + "ic-editor-link-blue.svg";
  pic8.src = assetsImageLocation + "ic-editor-spoiler-blue.svg";
  pic9.src = assetsImageLocation + "ic-editor-quote-blue.svg";
  pic10.src = assetsImageLocation + "ic-editor-smilies-blue.svg";
  pic11.src = assetsImageLocation + "ic-editor-poll-blue.svg";
  pic12.src = assetsImageLocation + "ic-editor-image-blue.svg";
  pic13.src = assetsImageLocation + "ic-editor-mention-blue.svg";

  // Init Script

  var textareaSCeditor = document.querySelector(
    ".jsCreateThreadContentSCEditor"
  );
  var toolbarSCEditor = document.getElementById("jsToolbarSCEditor");

  var heightSCEditor =
    $(window).height() -
    $(".jsCreateThreadHeader").outerHeight() -
    $(".jsCreateThreadTitle").outerHeight() -
    $(".jsToolbarSCEditorAnchor").outerHeight() -
    90 -
    20 -
    30 -
    20 -
    36 -
    36;

  $(window).on("resize", function () {
    var heightSCEditor =
      $(window).height() -
      $(".jsCreateThreadHeader").outerHeight() -
      $(".jsCreateThreadTitle").outerHeight() -
      $(".jsToolbarSCEditorAnchor").outerHeight() -
      90 -
      20 -
      30 -
      20 -
      36;
    sceditorInstance.height(heightSCEditor);
  });

  var createThreadEditor = sceditor.create(textareaSCeditor, {
    style: sceditorStyleLocation,
    spellcheck: false,
    plugins: "bbcode,undo",
    emoticonsEnabled: false,
    format: 'bbcode',
    toolbar: 'bold,italic,underline|left,center,right,justify|font,color,size|link,spoiler,quote,source,validate,polling|mention,media,smilies',
    toolbarContainer: toolbarSCEditor,
    resizeMaxHeight: -1,
    height: heightSCEditor,
    icons: "custom",
    autoExpand: true,
    resizeEnabled: false,
    placeholder: "Mulai Menulis!",
  });

  var sceditorInstance = sceditor.instance(textareaSCeditor);
  $(sceditorInstance.getBody()).addClass("bodyTextArea");

  if (sceditorInstance.val() != "") {
    $(sceditorInstance.getBody()).removeClass("placeholder");
  }

  $('.sceditor-color-option[data-color="#484848"]').addClass("is-selected");

  sceditorInstance.keyPress(function (e) {
    if (e.which == 13) {
      if (
        !(
          $(window).scrollTop() + $(window).height() >
          $(document).height() - $(".jsToolbarSCEditorAnchor").height()
        )
      ) {
        //console.log("lagi di atas");
      } else {
        //console.log("lagi dibawah");
        $("html, body").animate(
          {
            scrollTop: $(document).height(),
          },
          100
        );
      }
    }
  });

  sceditorInstance.bind("paste", function (event) {
    setTimeout(function () {
      sceditorInstance.insert(" ");
      sceditorInstance.val().substring(0, sceditorInstance.val().length - 1);
    }, 10);
  });

  // countChars
  sceditorInstance.keyUp(function (e) {
    countChars();
    sceditorInstance.expandToContent(true);
  });

  function countChars() {
    var limitChar = 20000;
    var inputLength = sceditor.instance(textareaSCeditor).val().length;
    $(".jsCharacterCounter").text(limitChar - inputLength);
    if (inputLength > limitChar) {
      $(".jsCharacterCounter").addClass("C(c-red)");
      $(".jsCharacterCounter").removeClass("C(c-grey)");
    } else {
      $(".jsCharacterCounter").addClass("C(c-grey)");
      $(".jsCharacterCounter").removeClass("C(c-red)");
    }
  }

  $(document).on("click", ".jsClosePolling", function () {
    togglePolling();
  });

  $(document).on(
    "click",
    ".sceditor-button-font, .sceditor-button-color, .sceditor-button-size",
    function () {
      $(
        ".sceditor-button-media.active, .sceditor-button-smilies.active"
      ).removeClass("active");
      $(".jsExtraForm").hide();
    }
  );

  // var ifr = $('.jsCreateThreadContent iframe')[0];
  // $(sceditorInstance.getBody()).atwho('setIframe', ifr).atwho({
  //   at: "@",
  //   limit: 5,
  //   displayTimeout: 150,
  //   displayTpl: "<li class='D(f)'><img class='Bdrs(50%) Mend(10px)' src='../assets/images/image-square3.png' height='35' width='35'/> <div class='Fx(flexOne)'><div>${name}</div><div class='Fz(11px) small'>newbie</div></div> </li>",
  //   insertTpl: "<a href='#' class='mention'>${atwho-at}${name}</a>",
  //   data: ['m', 'ma', 'moon', 'man', 'max', 'mix', 'medy', 'rimaamalia', 'dinarizky', 'andypamungkas', 'kibi', 'koponk', 'kpopluckynumber', 'wkwkwkland', 'Zulting', 'medydwi', 'zenk', 'prayogitio', 'dekampes', 'sevsweet07', 'maylina']
  // })
}

// var tribute = new Tribute({
//   values: [
//     {key: 'Phil Heartman', value: 'pheartman'},
//     {key: 'Gordon Ramsey', value: 'gramsey'}
//   ]
// })
//
// tribute.attach(sceditorInstance.getBody());


function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {
    type: mime,
  });
}

function resetInputAvatarAndCoverValue() {
  if ($("#jsUploadAvatar").length) {
    $("#jsUploadAvatar").val("");
  }
  if ($("#jsUploadCover").length) {
    $("#jsUploadCover").val("");
  }
}

function removeAvatar() {
  $.post(
    "/user/removeprofilepicture/",
    {
      userimgrev: $("#userimgrev").val(),
    },
    function (e) {
      $("#userimgrev").val(e.userimgrev),
        $("#userimgtime").val(e.userimgtime),
        $("#jsImageAvatar").attr("src", e.imgurl);
      $.ajax({
        url: "/user/update_avatar",
        type: "post",
        data: {
          userimgtime: e.userimgtime,
          userimgrev: e.userimgrev,
          imgurl: e.url,
        },
        success: function (e) {
          e = $.parseJSON(e);
          $("#jsImageAvatar").attr("src", e.imgurl);
          $(".jsModal #jsImageAvatar").attr("src", e.imgurl);
          $(".jsModal #jsPreviewAvatar").attr("src", e.imgurl);
          $("#loading").html("");
          $("#remove_avatar").addClass("D(n)");
          closeModal();
        },
      });
    },
    "json"
  );
}

function uploadAvatar() {
  var $uploadCrop;
  var fileTypes = ["jpg", "png", "jpeg"];
  var myFile;

  function readFile(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var extension = input.files[0].name.split(".").pop().toLowerCase(),
          isAllowed = fileTypes.indexOf(extension) > -1;
        if (isAllowed) {
          openModal("jsModalCropAvatar");
          $(".cr-viewport").css("border-radius", "50%");
          setTimeout(function () {
            $uploadCrop.croppie("bind", {
              url: e.target.result,
            });
          }, 400);
        } else {
          myFile = input.files[0];
          var data = new FormData();
          data.append("userpicture", myFile);
          data.append("securitytoken", $(".sctoken").val());
          $.ajax({
            url: "/user/profilepicture",
            type: "POST",
            data: data,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function (e, t) {
              $(".sctoken").val(e.securitytoken);
              if (e.status == "ok") {
                $.ajax({
                  url: "/user/update_avatar",
                  type: "post",
                  data: {
                    userimgtime: e.userimgtime,
                    userimgrev: e.userimgrev,
                    imgurl: e.url,
                  },
                  success: function (e) {
                    $("#remove_avatar").removeClass("D(n)");
                    $("#jsImageAvatar").attr("src", reader.result);
                    $(".jsModal #jsImageAvatar").attr("src", reader.result);
                    $(".jsModal #jsPreviewAvatar").attr("src", reader.result);
                    $(document).click();
                  },
                });
              } else {
                $("#jsModalError #error_message").html(e.error);
                openModal("jsModalError");
              }
            },
          });
        }
      };
      reader.readAsDataURL(input.files[0]);
    } else {
      $("#jsModalError #error_message").html(
        "Sorry - your browser doesn't support the FileReader API"
      );
      openModal("jsModalError");
    }
  }

  $uploadCrop = $("#jsUploadAvatarCropper").croppie({
    viewport: {
      width: 250,
      height: 250,
      type: "square",
    },
  });

  $("#jsUploadAvatar").on("change", function () {
    readFile(this);
  });

  $("#jsButtonCropAvatar").on("click", function (ev) {
    $uploadCrop
      .croppie("result", {
        type: "base64",
        size: {
          width: 400,
          height: 400,
        },
        quality: 0.8,
        format: "png",
      })
      .then(function (resp) {
        $("#jsImageAvatar").attr("src", resp);
        $(".jsModal #jsImageAvatar").attr("src", resp);
        $(".jsModal #jsPreviewAvatar").attr("src", resp);
        var file = dataURLtoFile(resp, "myavatar.jpg");
        var data = new FormData();
        data.append("userpicture", file);
        data.append("securitytoken", $(".sctoken").val());
        $.ajax({
          url: "/user/profilepicture",
          type: "POST",
          data: data,
          processData: false,
          contentType: false,
          dataType: "json",
          success: function (e, t) {
            $(".sctoken").val(e.securitytoken);
            if (e.status == "ok") {
              $.ajax({
                url: "/user/update_avatar",
                type: "post",
                data: {
                  userimgtime: e.userimgtime,
                  userimgrev: e.userimgrev,
                  imgurl: e.url,
                },
                success: function (e) {
                  $("#remove_avatar").removeClass("D(n)");
                  closeModal();
                },
              });
            } else {
              $("#jsModalError #error_message").html(e.error);
              openModal("jsModalError");
            }
          },
        });
      });
  });
}

function removeCoverImage() {
  $.post(
    "/user/removecoverimage/",
    function (e) {
      $.ajax({
        url: "/user/removecoverimage",
        type: "post",
        data: {
          imgurl: e.old_cover_image_url,
          action: "delete",
        },
        success: function (result) {
          if (result != typeof "object") result = $.parseJSON(result);
          if (result.status == "ok") {
            $("#jsImageCover").attr(
              "src",
              assetsFolderNew + "/images/placeholder-cover-image.png"
            );
            $("#remove_cover").addClass("D(n)");
            closeModal();
          }
        },
      });
    },
    "json"
  );
}

function uploadCover() {
  var $uploadCrop;
  var fileTypes = ["jpg", "png", "jpeg"];
  var myFile;
  var oldcoverurl = $("#jsImageCover").attr("src");

  function readFile(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var extension = input.files[0].name.split(".").pop().toLowerCase(),
          isAllowed = fileTypes.indexOf(extension) > -1;
        if (isAllowed) {
          openModal("jsModalCropCover");
          $(".cr-viewport").css("border-radius", "");
          setTimeout(function () {
            $uploadCrop.croppie("bind", {
              url: e.target.result,
            });
          }, 400);
        } else {
          $("#jsModalError #error_message").html(
            "Hanya boleh upload gambar dengan ekstensi <b>.jpg</b>, <b>.png</b>, dan <b>.jpeg</b>"
          );
          openModal("jsModalError");
        }
      };
      reader.readAsDataURL(input.files[0]);
    } else {
      $("#jsModalError #error_message").html(
        "Sorry - your browser doesn't support the FileReader API"
      );
      openModal("jsModalError");
    }
  }

  $uploadCrop = $("#jsUploadCoverCropper").croppie({
    viewport: {
      width: 685,
      height: 113,
      type: "square",
    },
  });

  $("#jsUploadCover").on("change", function () {
    readFile(this);
  });

  $("#jsButtonCropCover").on("click", function (ev) {
    $uploadCrop
      .croppie("result", {
        type: "base64",
        size: {
          width: 970,
          height: 160,
        },
        quality: 0.8,
        format: "png",
      })
      .then(function (resp) {
        $("#jsImageCover").attr("src", resp);
        $(".jsModal #jsImageCover").attr("src", resp);
        var file = dataURLtoFile(resp, "mycover.jpg");
        var data = new FormData();
        data.append("userpicture", file);
        data.append("securitytoken", $(".sctoken").val());
        $.ajax({
          url: "/user/coverimage",
          type: "POST",
          data: data,
          processData: false,
          contentType: false,
          dataType: "json",
          success: function (e) {
            $(".sctoken").val(e.securitytoken);
            if (e.status == "ok") {
              $("#remove_cover").removeClass("D(n)");
              closeModal();
            } else {
              $("#jsModalError #error_message").html(e.error);
              openModal("jsModalError");
            }
          },
        });
      });
  });
}

function modify_notification_list(notification) {
  var offset = parseInt($("#notification_data").attr("data-offset"));
  var operation = notification.operation;
  if (operation == "delete") {
    if (
      $("#notif_wrapper_page #" + String(notification.notificationId)).length >
      0
    ) {
      $("#notif_wrapper_page #" + String(notification.notificationId)).remove();
      $("#notif_wrapper #" + String(notification.notificationId)).remove();
      $("#notification_data").attr("data-offset", offset - 1);
    }
    return;
  }
  var url =
    "/notification/get_notification/?displayed_state=" +
    notification.newState +
    "&notifId=" +
    notification.notificationId;
  $.get(url, function (result) {
    if (typeof result !== "object") {
      result = $.parseJSON(result);
    }
    notification = result.notification;
    switch (operation) {
      case "add":
        $("#notif_wrapper_page .notif_empty").hide();
        template = build_notification_card(notification);
        if (
          $("#notif_wrapper_page #" + String(notification._id.$id)).length > 0
        ) {
          $("#notif_wrapper_page #" + String(notification._id.$id)).remove();
        } else {
          $("#notification_data").attr("data-offset", offset + 1);
        }
        $("#notif_wrapper_page .notificationList")
          .prepend(template)
          .fadeIn(300);
        break;
      case "update":
        if (
          $("#notif_wrapper_page #" + String(notification._id.$id)).length > 0
        ) {
          $("#notif_wrapper_page #" + String(notification._id.$id)).remove();
          template = build_notification_card(notification);
          $("#notif_wrapper_page .notificationList")
            .prepend(template)
            .fadeIn(300);
        }
        break;
    }
  });
}

function build_notification_card(notification) {
  template = $("#notif_wrapper_page #notificationCardTemplate").html();
  template = template.replace("Bgc(c-white)", "Bgc(c-grayish)");
  template = template.replace(" data-src=", " src=");
  template = template.replace(/{notifType}/g, notification.type);
  template = template.replace("{notifId}", String(notification._id.$id));
  read_url =
    "/notification/read/" + String(notification._id.$id) + "/?is_pop_up=false";
  template = template.replace("{clickUrl}", read_url);
  target_attr =
    notification.type === "live_thread_selected" ? "_blank" : "_self";
  template = template.replace("{targetAttr}", target_attr);
  template = template.replace(
    "{postBody}",
    notification.additional_data.post_body
  );
  template = template.replace("{lastUpdated}", notification.last_updated);
  if (notification.additional_data.post_content) {
    template = template.replace("{postBodyAlign}", "fs");
    template = template.replace(
      "{postContent}",
      '<div class="C(c-darker-grey) Fz(13px) Lh(18px) Wob(breakWord) LineClamp(2,35px)">' +
      notification.additional_data.post_content +
      "</div>"
    );
  } else {
    template = template.replace("{postBodyAlign}", "c");
    template = template.replace("{postContent}", "");
  }
  if (notification.additional_data.img_src) {
    template = template.replace(
      "{imageSource}",
      '<div class="Fx(flexZero) Mstart(10px)"><img class="W(60px) H(60px)" src="' +
      notification.additional_data.img_src +
      '"></div>'
    );
  } else {
    template = template.replace("{imageSource}", "");
  }
  return template;
}


$(document).ready(function () {
  var notifications_loaded = false;
  var current_displayed_state = "";
  $(".get_notifications").click(function () {
    if ($(".jsNotificationDropdownMenu").hasClass("is-visible")) {
      $(".jsNotificationIcon i").attr("data-id", "header-notification");
    } else {
      $(".jsNotificationIcon i").removeAttr("data-id");
    }
    var displayed_state = $("#notification_data").attr("data-displayed_state");
    if (current_displayed_state != displayed_state) {
      notifications_loaded = false;
    }
    if (!notifications_loaded) {
      fetching_notif =
        '<img src="' +
        assetsFolderNew +
        '/images/icon-load-biru.gif" width="40" height="40" alt="notification-loading" />';
      $("#notif_wrapper").html(
        '<div class="Ta(c)">' + fetching_notif + "</div>"
      );
      var url =
        "/notification/show/all/?ispopup=true&displayed_state=" +
        displayed_state;
      $.get(url, function (result) {
        if (typeof result !== "object") {
          result = $.parseJSON(result);
        }
        $("#notification_see_more");
        $("#notif_wrapper").html(result.view);
        show_request_fcm_popup();
        bindRequestFcm();
        if ($(".notif_red").hasClass("D(tb)")) {
          $(".notif_red").removeClass("D(tb)");
          $(".notif_red").addClass("D(n)");
        }
        $("#notification_data").attr("data-displayed_state", result.new_state);
        current_displayed_state = displayed_state;
        notifications_loaded = true;
      });
    }
  });

  $(document).on('click', '.jsSubmitGAOnClick', function () {
    try {
      var gaJson = jQuery.parseJSON($(this).data('ga-json'));
    } catch (err) {
      var gaJson = $(this).data('ga-json');
    }
    $.each(gaJson, function (_, ga) {
      eventTracking(ga['category'], ga['action'], ga['label']);
    });
  });

  $('.jsSubmitGASelectedInputOnClick').on('click', function () {
    var gaCategory = $(this).data('ga-category');
    var gaAction = $(this).data('ga-action');
    var inputName = $(this).data('input-class');
    var gaLabel = $('input[name=" + inputName + "]:checked').data('tracking-label');
    $('.' + inputName).attr('onclick', build_ga_track_event(gaCategory, gaAction, gaLabel));
  });
});

function getDisplayedState() {
  return $("#notification_data").attr("data-displayed_state");
}

function getFetchNotifGif() {
  fetching_notif =
    '<img src="' +
    assetsFolderNew +
    '/images/icon-load-biru.gif" width="40" height="40" alt="notification-loading" />';
  html = '<div id="load_image" class="Ta(c)">' + fetching_notif + "</div>";
  return html;
}

function getTypeName(type) {
  type_name = "";
  switch (type) {
    case "all":
      type_name = "All (Default)";
      break;
    case "reputation":
      type_name = "Cendol";
      break;
    case "quoted_post":
      type_name = "Quote";
      break;
    case "thread_replies":
      type_name = "Reply";
      break;
  }
  return type_name;
}

function hideLoadMoreLink(element, newState) {
  var type = $(element + " #type ul li a.Fw\\(700\\)").attr("data-type");
  if (type == "reputation") $(element + " #see_more").addClass("D(n)");
  $("#notification_data").attr("data-displayed_state", newState);
  var total_notifications = parseInt($("#total_notif").attr("value"));
  if ($("#notification_data").attr("data-offset") >= total_notifications - 30) {
    $(element + " .load_more").hide();
    $(element + " #see_more").addClass("D(n)");
  }
}

function getNotifications(element, type) {
  $(element + " #notif_counter_wrapper").removeClass("D(n)");
  $(element + " .notificationList").html(getFetchNotifGif());
  $("#notification_data").attr("data-offset", 0);
  if (type == "quoted_post") {
    $(element + " #notif_counter_wrapper").addClass("D(n)");
    $(element + " #filterName").text(getTypeName(type));
    $(element + " #type a").removeClass("Fw(700)");
    $(element + " #type [data-type=quoted_post]").addClass("Fw(700)");
    $(element + " #type").removeClass("is-visible");
    url =
      "/myforum/myquotedpost/?offset=" +
      $("#notification_data").attr("data-offset");
    getNotificationData(element, url);
  } else if (type == "reputation") {
    $(element + " #notif_counter_wrapper").addClass("D(n)");
    $(element + " #filterName").text(getTypeName(type));
    $(element + " #type a").removeClass("Fw(700)");
    $(element + " #type [data-type=reputation]").addClass("Fw(700)");
    $(element + " #type").removeClass("is-visible");
    url = "/notification/reputation";
    getNotificationData(element, url);
  } else {
    $(element + " .load_more").hide();
    type_name = getTypeName(type);
    displayed_state = getDisplayedState();
    url =
      "/notification/show/" +
      type +
      "/?ispopup=false&type_name=" +
      type_name +
      "&displayed_state=" +
      displayed_state;
    $.get(url, function (result) {
      if (typeof result !== "object") {
        result = $.parseJSON(result);
      }
      $("#notif_wrapper_page").html(result.view.replace(" data-src=", " src="));
      $(element + " .load_more").show();
      hideLoadMoreLink(element, result.new_state);
    });
  }
}

function getNotificationData(element, url) {
  $(element + " .notif_empty").hide();
  $(element + " #notif_empty_template").addClass("D(n)");
  var type = $(element + " #type ul li a.Fw\\(700\\)").attr("data-type");
  var view = "";
  if (!$(element + " #see_more").hasClass("D(n)")) {
    $(element + " #see_more").addClass("D(n)");
  }
  $.get(url, function (result) {
    if (typeof result !== "object") {
      result = $.parseJSON(result);
    }
    if (result.notifications.length == 0) {
      var cendol_empty =
        "Agan belum memiliki reputasi nih. Untuk mendapatkan cendol, Agan bisa mulai komen atau buat thread di Kaskus. Jika Kaskuser lain merasa thread Agan menarik, maka Agan bisa mendapatkan cendol atau bata.";
      var quote_empty =
        "Agan belum memiliki post yang dibalas nih. Coba deh Agan komen atau buat thread dulu.";
      if (type == "reputation")
        $(element + " #notif_empty_template span").text(cendol_empty);
      else if (type == "quoted_post")
        $(element + " #notif_empty_template span").text(quote_empty);
      $(element + " .notif_empty").hide();
      $(element + " #notif_empty_template").removeClass("D(n)");
    }
    $.each(result.notifications, function (notificationId, notification) {
      template = $(element + " #notificationCardTemplate").html();
      template = template.replace(" data-src=", " src=");
      template = template.replace(/{notifType}/g, notification.type);
      if (notification.url.indexOf("?") < 0) {
        if (notification.url.indexOf("#") < 0) {
          track_url =
            notification.url + "/?ref=notification&med=single_page_" + type;
        } else {
          track_url = notification.url.replace(
            "#",
            "/?ref=notification&med=single_page_" + type + "#"
          );
        }
      } else {
        if (notification.url.indexOf("#") < 0) {
          track_url =
            notification.url + "&ref=notification&med=single_page_" + type;
        } else {
          track_url = notification.url.replace(
            "#",
            "&ref=notification&med=single_page_" + type + "#"
          );
        }
      }
      template = template.replace("{notifId}", "");
      template = template.replace("{clickUrl}", track_url);
      template = template.replace(
        "{postBody}",
        notification.additional_data.post_body
      );
      template = template.replace("{lastUpdated}", notification.last_updated);
      if (notification.additional_data.post_content) {
        template = template.replace("{postBodyAlign}", "fs");
        template = template.replace(
          "{postContent}",
          '<div class="C(c-darker-grey) Fz(13px) Lh(18px) Wob(breakWord) LineClamp(2,35px)">' +
          notification.additional_data.post_content +
          "</div>"
        );
      } else {
        template = template.replace("{postBodyAlign}", "c");
        template = template.replace("{postContent}", "");
      }
      if (notification.additional_data.img_src) {
        template = template.replace(
          "{imageSource}",
          '<div class="Fx(flexZero) Mstart(10px)"><img class="W(60px) H(60px)" src="' +
          notification.additional_data.img_src +
          '"></div>'
        );
      } else {
        template = template.replace("{imageSource}", "");
      }
      view += template;
    });
    $(element + " .notificationList").append(view);
    $(element + " #load_image").remove();
    $("#total_notif").attr("value", result.total_notif);
    $(element + " #see_more").removeClass("D(n)");
    hideLoadMoreLink(element, getDisplayedState());
  });
}

function seeMore() {
  var element = "#notif_wrapper_page";
  $(element + " .load_more").hide();
  if (!$(element + " #see_more").hasClass("D(n)") && type == "quoted_post") {
    $(element + " #see_more").addClass("D(n)");
  }
  $(element + " #notification_see_more").append(getFetchNotifGif());
  var type = $(element + " #type ul li a.Fw\\(700\\)").attr("data-type");
  var offset = parseInt($("#notification_data").attr("data-offset"));
  $("#notification_data").attr("data-offset", offset + 30);
  if (type == "quoted_post") {
    $(element + " .notificationList").append(getFetchNotifGif());
    url =
      "/myforum/myquotedpost/?offset=" +
      $("#notification_data").attr("data-offset");
    getNotificationData(element, url);
  } else if (type == "reputation") {
    $(element + " .notificationList").append(getFetchNotifGif());
    url = "/notification/reputation";
    getNotificationData(element, url);
  } else {
    type_name = getTypeName(type);
    displayed_state = getDisplayedState();
    var url =
      "/notification/show/" +
      type +
      "/?ispopup=false&type_name=" +
      type_name +
      "&displayed_state=" +
      displayed_state +
      "&offset=" +
      $("#notification_data").attr("data-offset");
    $.get(url, function (result) {
      if (typeof result !== "object") {
        result = $.parseJSON(result);
      }
      $(element + " #notification_see_more #load_image").remove();
      $(element + " #notification_see_more").append(
        result.view.replace(" data-src=", " src=")
      );
      if (type == "quoted_post") $(element + " #see_more").removeClass("D(n)");
      $(element + " .load_more").show();
      hideLoadMoreLink(element, result.new_state);
    });
  }
}

$("#qr-code-btn").click(function () {
  $.ajax({
    url: "/profile/qrcode/" + $(this).data("userid"),
    success: function (result) {
      var qrcode = result["qrcode"];
      if (qrcode) {
        $("#img-qrcode").attr("src", "data:image/png;base64," + qrcode);
      } else {
        $("#img-qrcode").hide();
        $("#div-qr-code").html("Failed to generate QR Code");
      }
    },
  });
});

function ignoreDataLayer(type) {
  dataLayer.push({
    event: "trackEvent",
    "eventDetails.category": "connection",
    "eventDetails.action": type,
    "eventDetails.label": "profile",
  });
}

function add_connection(url, username) {
  closeModal();

  var currentid = $("#currentid").val();
  var loginid = $("#loginid").val();
  var clickid = url.substring(url.lastIndexOf("/") + 1);
  $.post(
    url,
    {
      securitytoken: $("#sctoken").val(),
    },
    function (data) {
      $("#sctoken").val(data.securitytoken);
      if (data.result == true) {
        var followingInfo = parseInt(
          $("#following_info").text().replace(/[,\.]/g, "")
        );
        var followerInfo = parseInt(
          $("#follower_info").text().replace(/[,\.]/g, "")
        );
        if (data.connection_type == "Unfollow") {
          if (currentid == loginid || clickid == currentid) {
            $("#unfollow_btn").show();
            $("#follow_btn").hide();
            $("#unfollow_btn_" + $.escapeSelector(username)).show();
            $("#follow_btn_" + $.escapeSelector(username)).hide();
            $("#unblock_btn_" + $.escapeSelector(username)).hide();

            if (currentid == loginid) {
              count = followingInfo + 1;
              $("#following_info").text(count.toLocaleString());
            }

            if (clickid == currentid) {
              count = followerInfo + 1;
              $("#follower_info").text(count.toLocaleString());
            }
          }

          followCustomMetrics("follow", loginid, clickid);
          showBottomToast("Agan berhasil mengikuti " + username, 1500);
        } else if (data.connection_type == "Follow") {
          if (currentid == loginid || clickid == currentid) {
            $("#follow_btn").show();
            $("#unfollow_btn").hide();
            $("#blocked_btn").hide();
            $("#unfollow_btn_" + $.escapeSelector(username)).hide();
            $("#follow_btn_" + $.escapeSelector(username)).show();
            $("#unblock_btn_" + $.escapeSelector(username)).hide();

            if (!data.hasOwnProperty("number_of_following")) {
              $("#block_btn").show();
              $("#unblock_btn").hide();
            } else {
              if (currentid == loginid) {
                count = followingInfo - 1;
                $("#following_info").text(count.toLocaleString());
              }

              if (clickid == currentid) {
                count = followerInfo - 1;
                $("#follower_info").text(count.toLocaleString());
              }
            }
          }

          if (!data.hasOwnProperty("number_of_following")) {
            ignoreDataLayer("unignore");
            showBottomToast(
              "Agan telah menghapus " + username + " dari ignore list",
              1500
            );
          } else {
            followCustomMetrics("unfollow", loginid, clickid);
            showBottomToast("Agan telah berhenti mengikuti " + username, 1500);
          }
        } else if (data.connection_type == "Unblock") {
          if (currentid == loginid || clickid == currentid) {
            var attr = $("#follow_btn").attr("style");

            $("#unblock_btn").show();
            $("#block_btn").hide();
            $("#follow_btn").hide();
            $("#unfollow_btn").hide();
            $("#blocked_btn").show();
            $("#unblock_btn").attr("data-id", "unignore");

            if (attr && typeof attr !== typeof undefined && attr !== false) {
              if (currentid == loginid) {
                count = followingInfo - 1;
                $("#following_info").text(count.toLocaleString());
              }

              if (clickid == currentid) {
                count = followerInfo - 1;
                $("#follower_info").text(count.toLocaleString());
              }

              followCustomMetrics("ignore", loginid, clickid);
            } else {
              ignoreDataLayer("ignore");
            }
          }
          showBottomToast("Agan berhasil mengabaikan " + username, 1500);
        }
      } else if (data.result == false) {
        showBottomToast(data.error_message, 1500);
      }
    },
    "json"
  );
}

function followCustomMetrics(type, userid, targetid) {
  dataLayer.push({
    event: "trackEvent",
    "eventDetails.category": "connection",
    "eventDetails.action": type,
    "eventDetails.label": "profile",
    Follow: type === "follow" ? 1 : -1,
    userID: userid,
    userIDHit: targetid,
  });
}

function intentToSignInMetrics(label) {
  obj = {
    event: "trackEvent",
    "eventDetails.category": "Sign In",
    "eventDetails.action": "intent to sign in",
    "eventDetails.label": label,
  };
  _gaq.push([
    "_trackEvent",
    obj["eventDetails.category"],
    obj["eventDetails.action"],
    label,
  ]);
  dataLayer.push(obj);
}

$(document).on(
  {
    mouseenter: function () {
      $(this).find("span").text($(this).data("hover"));
      $(this).find("i").toggleClass("fa-user-lock fa-unlock");
    },
    mouseleave: function () {
      $(this).find("span").text($(this).data("default"));
      $(this).find("i").toggleClass("fa-user-lock fa-unlock");
    },
  },
  ".jsButtonBlockedHeader"
);

$(document).on(
  {
    mouseenter: function () {
      $(this).text($(this).data("hover"));
    },
    mouseleave: function () {
      $(this).text($(this).data("default"));
    },
  },
  ".jsFollowingButton, .jsBlockedButton"
);

var moderated_page = 1;
var load_more_forum =
  '<li id="forum-loadmore" class="D(f) Ai(c) Mb(15px)"><a data-id="moderator-load-more" onclick="load_more_moderated_forum()" href="javascript:void(0)" class="D(b) W(100%) Bgc(#1998ed):h C(c-white):h Td(n):h D(b) Py(7px) Px(7px) Fw(500) Ta(c) C(#1998ed) Bd(borderSolidBlue) Bdrs(5px) Mb(10px)">Load More</a></li>';

function moderate() {
  moderated_page = 1;
  $("#jsModalModerateList .data-moderate").empty();
  $.get(
    "/profile/get_all_forum_moderate/?user_id=" +
    user_id +
    "&moderate_page=" +
    moderated_page,
    function (result) {
      if (typeof result !== "object") {
        result = $.parseJSON(result);
      }
      forum_moderate = result.result.list_forum;
      forum_icon = result.result.forum_icon;
      var html_view = "";

      delete forum_moderate.total_post;
      $.each(forum_moderate, function (key, forum) {
        html_view +=
          '<div class="D(f) Ai(c) Py(10px)"><div class="Fx(flexZero)"><img src="' +
          forum_icon[key] +
          '" class="W(50px) H(50px)" /></div><div class="Fx(flexOne) Ta(s) Mstart(20px)"><a class="Fw(500) C(c-normal))" href="' +
          forum.url +
          '">' +
          forum.name +
          "</a></div></div>";
      });

      moderated_page = result.result.next_page;
      page_remaining = result.result.page_remaining;
      $("#jsModalModerateList .data-moderate").append(html_view);
      if (page_remaining > 0) {
        $("#jsModalModerateList .data-moderate").append(load_more_forum);
      }
    }
  );
}

function load_more_moderated_forum() {
  $.get(
    "/profile/get_all_forum_moderate/?user_id=" +
    user_id +
    "&moderate_page=" +
    moderated_page,
    function (result) {
      if (typeof result !== "object") {
        result = $.parseJSON(result);
      }
      forum_moderate = result.result.list_forum;
      forum_icon = result.result.forum_icon;
      var html_view = "";

      delete forum_moderate.total_post;
      $.each(forum_moderate, function (key, forum) {
        html_view +=
          '<div class="D(f) Ai(c) Py(10px)"><div class="Fx(flexZero)"><img src="' +
          forum_icon[key] +
          '" class="W(50px) H(50px)" /></div><div class="Fx(flexOne) Ta(s) Mstart(20px)"><a class="Fw(500) C(c-normal))" href="' +
          forum.url +
          '">' +
          forum.name +
          "</a></div></div>";
      });

      moderated_page = result.result.next_page;
      page_remaining = result.result.page_remaining;
      $("#jsModalModerateList .data-moderate").append(html_view);
      $("#forum-loadmore").remove();

      if (page_remaining > 0) {
        $("#jsModalModerateList .data-moderate").append(load_more_forum);
      }
    }
  );
}

var badge_page = 1;
var load_more =
  '<li id="badge-loadmore" class="D(f) Ai(c) Mb(15px)"><a data-id="badge-load-more" onclick="load_more_badge()" href="javascript:void(0)" class="D(b) W(100%) Bgc(#1998ed):h C(c-white):h Td(n):h D(b) Py(7px) Px(7px) Fw(500) Ta(c) C(#1998ed) Bd(borderSolidBlue) Bdrs(5px) Mb(10px)">Lihat Lainnya</a></li>';

function badge() {
  badge_page = 1;
  $("#jsModalBadgeList .data-badge").empty();
  $.get(
    "/profile/get_all_badges/?user_id=" + user_id + "&badge_page=" + badge_page,
    function (result) {
      if (typeof result !== "object") {
        result = $.parseJSON(result);
      }

      list_badge = result.result.badges;
      var html_view = "";
      delete list_badge.total_post;
      $.each(list_badge, function (key, badge) {
        html_view +=
          '<div class="D(f) Ai(c) Py(10px)"><div class="Fx(flexZero)"><img src="' +
          badge_url +
          badge.badge_id +
          '.gif" class="W(50px) H(50px)" /></div><div class="Fx(flexOne) Ta(s) Mstart(20px)"><div class="Fw(500) ">' +
          badge.event +
          '</div><div class="Mt(5px) Fz(11px) C(c-grey)"></div></div></div>';
      });

      badge_page = result.result.next_page;
      page_remaining = result.result.page_remaining;

      $("#jsModalBadgeList .data-badge").append(html_view);
      if (page_remaining > 0) {
        $("#jsModalBadgeList .data-badge").append(load_more);
      }
    }
  );
}

function load_more_badge() {
  $.get(
    "/profile/get_all_badges/?user_id=" + user_id + "&badge_page=" + badge_page,
    function (result) {
      if (typeof result !== "object") {
        result = $.parseJSON(result);
      }
      list_badge = result.result.badges;

      var html_view = "";
      delete list_badge.total_post;
      $.each(list_badge, function (key, badge) {
        html_view +=
          '<div class="D(f) Ai(c) Py(10px)"><div class="Fx(flexZero)"><img src="' +
          badge_url +
          badge.badge_id +
          '.gif" class="W(50px) H(50px)" /></div><div class="Fx(flexOne) Ta(s) Mstart(20px)"><div class="Fw(500) ">' +
          badge.event +
          '</div><div class="Mt(5px) Fz(11px) C(c-grey)"></div></div></div>';
      });

      badge_page = result.result.next_page;
      page_remaining = result.result.page_remaining;

      $("#jsModalBadgeList .data-badge").append(html_view);
      $("#badge-loadmore").remove();

      if (page_remaining > 0) {
        $("#jsModalBadgeList .data-badge").append(load_more);
      }
    }
  );
}

var assetsFolderNew = assetsFolderNew || "";
var loading_img =
  '<div class="W(100%) Ta(c) Mt(50px) Mb(50px)"><img src="' +
  assetsFolderNew +
  '/images/icon-load-biru.gif" width="40" height="40" alt="conection-loading" /></div>';
var tab = $("#tab-act").val();
var connection_type = "following";
var userid = $("#current-user").val();
var current_page = $("#current-page").val();

function get_list_connection(connection_type) {
  $("#loading-area").html(loading_img);
  $("#pagination").html("");

  $.get(
    "/friend/connection/" +
    connection_type +
    "/?id=" +
    userid +
    "&page=" +
    current_page,
    function (data) {
      $("#loading-area").html(data.html);
      $("#pagination").html(data.pagination);
    },
    "json"
  );
}

function connection_action(url, username, type) {
  var loginid = $("#loginid").val();
  var clickid = url.substring(url.lastIndexOf("/") + 1);
  $.post(
    url,
    {
      securitytoken: $("#sctoken").val(),
    },
    function (data) {
      $("#sctoken").val(data.securitytoken);
      if (data.result == true) {
        get_list_connection(type);
        if (url.search("/follow") > 0) {
          followCustomMetrics("follow", loginid, clickid);
          showBottomToast("Agan berhasil mengikuti " + username, 1500);
        } else if (url.search("/unfollow") > 0) {
          followCustomMetrics("unfollow", loginid, clickid);
          showBottomToast("Agan telah berhenti mengikuti  " + username, 1500);
        } else if (url.search("/unblock") > 0) {
          ignoreDataLayer("unignore");
          showBottomToast(
            "Agan telah menghapus " + username + " dari ignore list",
            1500
          );
        }
      } else {
        showBottomToast(data.error_message, 3000);
      }
    },
    "json"
  );
}

function modal_action(url, username, type) {
  closeModal();
  connection_action(url, username, type);
}

function set_connection_unfol_modal(
  image_unfol,
  text_unfol,
  url_unfol,
  username,
  modal
) {
  $("#jsModalConfirmUnfollow img").attr("src", image_unfol);
  $(".confirm-action").removeAttr("data-id").attr("data-id", "button-unfollow");
  connection_show_modal_confirm(url_unfol, text_unfol, username, modal);
}

function set_connection_unblock_modal(
  image_unblock,
  text_unblock,
  url_unblock,
  username,
  modal
) {
  $("#jsModalConfirmUnblock img").attr("src", image_unblock);
  $(".confirm-action").removeAttr("data-id").attr("data-id", "button-unignore");
  connection_show_modal_confirm(url_unblock, text_unblock, username, modal);
}

function connection_show_modal_confirm(url, text, username, modal) {
  $("#confirm-subtitle, #confirm-message").html(text);
  $(".confirm-action, .confirm-action-unignore").attr(
    "onclick",
    "modal_action('" + url + "', '" + username + "', '" + modal + "')"
  );
}

function searchConnection() {
  if ($("#search_connection_keyword").val() != "") {
    var b = $.ajax();
    b.abort();

    var userid = $("#current-user").val();
    var keyword = $("#search_connection_keyword").val();

    $("#loading-area").html(loading_img);
    $("#pagination").html("");

    $.get(
      "/friend/search_connection/" + tab + "/" + userid + "/" + keyword,
      function (response) {
        $("#loading-area").html(response.html);
      },
      "json"
    );
  } else {
    alert("Silahkan masukkan kata kunci terlebih dahulu.");
  }
}


var topicDetailThreadLoading = false;
var showcaseLoading = false;

function bindThreadShowcaseNext() {
  if ($("#trigger-showcase").length > 0) {
    window.addEventListener("resize", fetch_more_thread_showcase, {
      passive: !0,
    });
    window.addEventListener("scroll", fetch_more_thread_showcase, {
      passive: !0,
    });
    window.addEventListener("touch", fetch_more_thread_showcase, {
      passive: !0,
    });
    window.addEventListener("click", fetch_more_thread_showcase, {
      passive: !0,
    });
  }
}

function removeThreadShowcaseAutoload() {
  window.removeEventListener("resize", fetch_more_thread_showcase);
  window.removeEventListener("scroll", fetch_more_thread_showcase);
  window.removeEventListener("touch", fetch_more_thread_showcase);
  window.removeEventListener("click", fetch_more_thread_showcase);
  $("#trigger-showcase").hide();
}

function fetch_more_thread_showcase() {
  var anchor = $("#trigger-showcase");
  if (showcaseLoading || !isElementInViewport(anchor)) {
    return;
  }
  showcaseLoading = true;
  var offset = anchor.attr("data-offset");
  var status = anchor.attr("data-status");

  $.ajax({
    url:
      KASKUS_URL +
      "/threadshowcase/load_more_hot_topic_list/" +
      offset +
      "/?status=" +
      status,
    type: "GET",
    xhrFields: {
      withCredentials: true,
    },
    success: function (response) {
      if (typeof response !== "object") {
        response = $.parseJSON(response);
      }
      if (response.error != 0 || response.showcases.length == 0) {
        showcaseLoading = false;
        removeThreadShowcaseAutoload();
      }
      var showcaseData = response.showcases;
      var baseElm = $(".showcase-base").first();
      var newElem = "";
      for (var i = 0; i < showcaseData.length; i++) {
        newElm = baseElm.clone();
        newElm.attr(
          "href",
          "/topic/" + showcaseData[i].url + "/?ref=topiclist&med=topicshowcase"
        );
        newElm.attr("onclick", showcaseData[i].tracking);
        $(newElm).find("img").attr("data-src", showcaseData[i].media_vertical);
        $(newElm).find("img").attr("alt", showcaseData[i].url);
        $(newElm).find("img").attr("class", "mls-img");
        newElm.removeClass("D(n) showcase-base");
        newElm.insertBefore(baseElm);
        $(".mls-img").kslzy(300);
      }
      var newOffset = parseInt(parseInt(offset) + showcaseData.length);
      anchor.attr("data-offset", newOffset);
      showcaseLoading = false;
      dataLayer.push({
        event: "trackEvent",
        "eventDetails.category": "topic list",
        "eventDetails.action": "load more",
        "eventDetails.label": "topic",
      });
    },
    error: function () {
      showcaseLoading = false;
      removeThreadShowcaseAutoload();
    },
  });
}

// bind vote
$("#threadlist_visualita, #hotthread_visualita").on(
  "click",
  ".vote-thread",
  function (e) {
    var source = $(this);
    let post_id = source.data("postid");
    let user_id = source.data("userid");
    let post_user_id = source.data("postuserid");
    let status = source.data("status-vote");
    let security_token = $("#securitytoken").val();
    $.ajax({
      url: KASKUS_URL + "/give_vote/" + post_id,
      type: "POST",
      dataType: "json",
      data: {
        status: status,
        securitytoken: security_token,
      },
      xhrFields: {
        withCredentials: true,
      },
      success: function (resp) {
        $("#securitytoken").val(resp.securitytoken);
        if (resp.result == true) {
          if (status == 1) {
            toggleUpVote(source, resp);
          } else {
            toggleDownVote(source, resp);
          }
          $("#total-vote-" + post_id).text(resp.total_vote);
          showBottomToast(resp.message, 2000);
        } else {
          if (resp.show_cta_join == true) {
            showCtaJoin(source);
            return;
          }
          if (typeof user_id != "undefined" && user_id.length == 0) {
            let label = status == 1 ? "cendol" : "bata";
            intentToSignInMetrics(label);
          }
          showBottomToast(resp.message_return, 2000);
        }
      },
      error: function (xhr) {},
    });
    return false;
  }
);

$("#hotthread_visualita").on("click", ".fa-vote", function (e) {
  var source = $(this);
  let post_id = source.data("postid");
  let user_id = source.data("userid");
  let post_user_id = source.data("postuserid");
  let status = source.data("status-vote");
  let security_token = $("#securitytoken").val();
  $.ajax({
    url: KASKUS_URL + "/give_vote/" + post_id,
    type: "POST",
    dataType: "json",
    data: {
      status: status,
      securitytoken: security_token,
    },
    xhrFields: {
      withCredentials: true,
    },
    success: function (resp) {
      $("#securitytoken").val(resp.securitytoken);
      if (resp.result == true) {
        if (status == 1) {
          toggleFAColor(source);
        } else {
          toggleFAColor(source);
        }
        $("#total-vote-" + post_id).text(resp.total_vote);
        showBottomToast(resp.message, 2000);
      } else {
        if (typeof user_id != "undefined" && user_id.length == 0) {
          let label = status == 1 ? "cendol" : "bata";
          intentToSignInMetrics(label);
        }
        if (resp.show_cta_join) {
          showCtaJoin(source.parents(".vote-wrapper"));
        } else {
          showBottomToast(resp.message_return, 2000);
        }
      }
    },
    error: function (xhr) {},
  });
  return false;
});
function toggleFAColor(elm) {
  let action = -2;
  let prev_action = 0;
  prev_action = elm
    .parents(".vote-wrapper")
    .find(".is-down-vote")
    .hasClass(fa_downvote_color)
    ? -1
    : prev_action;
  prev_action = elm
    .parents(".vote-wrapper")
    .find(".is-up-vote")
    .hasClass(fa_upvote_color)
    ? 1
    : prev_action;
  if (elm.hasClass(fa_novote_color)) {
    elm.removeClass(fa_novote_color);
  }
  if (elm.hasClass("is-up-vote")) {
    action = 1;
    elm.toggleClass(fa_upvote_color);
    elm
      .parents(".vote-wrapper")
      .find(".is-down-vote")
      .removeClass(fa_downvote_color);
    if (!elm.hasClass(fa_upvote_color)) {
      elm.addClass(fa_novote_color);
      action = 0;
    }
  } else if (elm.hasClass("is-down-vote")) {
    action = -1;
    elm.toggleClass(fa_downvote_color);
    elm
      .parents(".vote-wrapper")
      .find(".is-up-vote")
      .removeClass(fa_upvote_color);
    if (!elm.hasClass(fa_downvote_color)) {
      elm.addClass(fa_novote_color);
      action = 0;
    }
  }
  elm
    .parents(".vote-wrapper")
    .find(".is-down-vote")
    .addClass(function () {
      return $(this).hasClass(fa_downvote_color) ? "" : fa_novote_color;
    });
  elm
    .parents(".vote-wrapper")
    .find(".is-up-vote")
    .addClass(function () {
      return $(this).hasClass(fa_upvote_color) ? "" : fa_novote_color;
    });
  ga_custom_track_vote_fa(elm, action, prev_action);
}
function ga_custom_track_vote_fa(source, action, prev_action) {
  var category = source.attr("data-category");
  var status = source.attr("data-status-vote");
  var postId = source.attr("data-postid");
  var userId = source.attr("data-userid");
  var userIdHit = source.attr("data-postuserid");
  let cendol_action = 1;
  let bata_action = -1;
  let undo_action = 0;
  let obj = {
    event: "trackEvent",
    "eventDetails.category": category,
    "eventDetails.label": postId,
    userID: userId,
    userIDHit: userIdHit,
    postID: postId,
  };
  if (action != undo_action) {
    if (action == cendol_action) {
      obj["eventDetails.action"] = "cendol";
      obj["threadCendol"] = "1";
      if (prev_action == bata_action) {
        obj["threadBata"] = "-1";
      }
    } else if (action == bata_action) {
      obj["eventDetails.action"] = "bata";
      obj["threadBata"] = "1";
      if (prev_action == cendol_action) {
        obj["threadCendol"] = "-1";
      }
    }
  } else {
    if (status == cendol_action) {
      obj["eventDetails.action"] = "uncendol";
      obj["threadCendol"] = "-1";
    } else if (status == bata_action) {
      obj["eventDetails.action"] = "unbata";
      obj["threadBata"] = "-1";
    }
  }
  dataLayer.push(obj);
}

function toggleUpVote(source, resp = null) {
  if (resp === null) {
    $(".is-up-vote", source).toggleClass("active");
    var targetParent = source.parents(".vote-wrapper");
    targetParent.find(".is-down-vote").removeClass("active");
  } else {
    doToggleUpVote(source, resp);
    return;
  }
}

function doToggleUpVote(source, resp) {
  source.toggleClass("active");

  var wrapper = source.closest(".vote-wrapper");
  var last_status = 0;
  var downVote = wrapper.find(".is-down-vote");

  if (downVote.hasClass("active")) {
    downVote.removeClass("active");
    last_status = -1;
  }
  wrapper.find(".vote-value").html(resp.upvote - resp.downvote);

  ga_custom_track_vote(source, resp, last_status);

  var bata_href = wrapper.find(".is-down-vote");
  if (!bata_href.hasClass("vote-thread")) {
    bata_href.addClass("vote-thread");
  }
}

function toggleDownVote(source, resp = null) {
  if (resp === null) {
    $(".is-down-vote", source).toggleClass("active");
    var targetParent = source.parents(".vote-wrapper");
    targetParent.find(".is-up-vote").removeClass("active");
  } else {
    doToggleDownVote(source, resp);
    return;
  }
}

function doToggleDownVote(source, resp) {
  source.toggleClass("active");

  var wrapper = source.closest(".vote-wrapper");
  var last_status = 0;
  var upVote = wrapper.find(".is-up-vote");

  if (upVote.hasClass("active")) {
    upVote.removeClass("active");
    last_status = 1;
  }
  wrapper.find(".vote-value").html(resp.upvote - resp.downvote);

  ga_custom_track_vote(source, resp, last_status);

  if (resp.disable_bata == true) {
    source.removeClass("vote-thread");
  }
}

function ga_custom_track_vote(source, resp, last_status) {
  var category = source.attr("data-category");
  var status = source.attr("data-status-vote");
  var postId = source.attr("data-postid");
  var userId = source.attr("data-userid");
  var userIdHit = source.attr("data-postuserid");
  var wrapper = source.closest(".vote-wrapper");
  var threadCendol = 0;
  var threadBata = 0;

  let obj = {
    event: "trackEvent",
    "eventDetails.category": category,
    "eventDetails.label": postId,
    userID: userId,
    userIDHit: userIdHit,
    postID: postId,
  };

  if (last_status != 0) {
    obj["eventDetails.action"] = last_status < 0 ? "cendol" : "bata";
    obj["threadCendol"] = last_status > 0 ? "-1" : "1";
    obj["threadBata"] = last_status < 0 ? "-1" : "1";
  } else {
    if (status == 1) {
      let condition = source
        .closest(".vote-wrapper")
        .find(".is-up-vote")
        .hasClass("active");
      obj["eventDetails.action"] = condition ? "cendol" : "uncendol";
      obj["threadCendol"] = condition ? "1" : "-1";
    } else {
      let condition = source
        .closest(".vote-wrapper")
        .find(".is-down-vote")
        .hasClass("active");
      obj["eventDetails.action"] = condition ? "bata" : "unbata";
      obj["threadBata"] = condition ? "1" : "-1";
    }
  }

  _gaq.push(["_trackEvent", category, obj["eventDetails.action"], postId]);
  dataLayer.push(obj);
}

function landing_connection(followBtn) {
  var url = followBtn.attr("data-url");
  var creator_id = followBtn.attr("data-creator-id");
  var current_id = followBtn.attr("data-user-id");
  var creator_username = followBtn.attr("data-creator-username");
  var securitytoken = $("#securitytoken").val();

  $.post(
    url,
    {
      securitytoken: securitytoken,
    },
    function (data) {
      if (typeof data !== "object") {
        data = $.parseJSON(data);
      }

      $("#securitytoken").val(data.securitytoken);
      if (data.result == true) {
        if (data.connection_type == "Unfollow") {
          followBtn.attr("data-default", data.label_connection);
          followBtn.attr("data-hover", data.word);
          followBtn.attr("data-url", data.url);
          followBtn.text(data.label_connection);
          followBtn.addClass(
            "Bdw(1px) Bds(s) C(c-blue) Bgc(c-white) Bgc(c-red):h Bdc(c-red):h Td(n):h C(c-white):h"
          );
          followBtn.removeClass(
            "Bgc(c-blue) C(c-white) Bd(borderSolidLightGrey)"
          );

          followCustomMetrics("follow", current_id, creator_id.toString());
          showBottomToast(
            window.KASKUS_lang.success_follow_msg.replace(
              "%s",
              creator_username
            ),
            3000
          );
          bindTopKreatorHoverFollowBtn();
        } else if (data.connection_type == "Follow") {
          followBtn.removeAttr("data-default");
          followBtn.removeAttr("data-hover");
          followBtn.attr("data-url", data.url);
          followBtn.text(data.word);

          if (data.hasOwnProperty("number_of_following")) {
            followCustomMetrics("unfollow", current_id, creator_id.toString());
            showBottomToast(
              window.KASKUS_lang.success_unfollow_msg.replace(
                "%s",
                creator_username
              ),
              3000
            );
          } else {
            ignoreDataLayer("unignore");
            showBottomToast(
              window.KASKUS_lang.success_unignore_msg.replace(
                "%s",
                creator_username
              ),
              3000
            );
          }
          followBtn.addClass(
            "Bdw(1px) Bds(s) Bgc(c-blue) C(c-white) Bd(borderSolidLightGrey)"
          );
          followBtn.removeClass(
            "C(c-blue) Bgc(c-white) Bgc(c-red):h Bdc(c-red):h Td(n):h C(c-white):h"
          );
          followBtn.removeClass(
            "Bgc(c-gray-2) Bgc(c-blue):h Td(n):h C(c-normal) C(c-white):h"
          ); //remove class styling from blocked user
          $(this).unbind("mouseenter mouseleave");
        }
      } else if (data.result == false) {
        if (typeof user_id != "undefined" && user_id.length == 0) {
          intentToSignInMetrics("ikuti");
        }
        showBottomToast(data.error_message, 3000);
      }
    },
    "json"
  );
}

function bindTopKreatorClickFollowBtn() {
  $(".jsLandingFollowBtn").click(function () {
    landing_connection($(this));
  });
}

function bindTopKreatorHoverFollowBtn() {
  $(".jsLandingFollowBtn")
    .mouseenter(function () {
      $(this).text($(this).attr("data-hover"));
    })
    .mouseleave(function () {
      $(this).text($(this).attr("data-default"));
    });
}

function bindTopicDetailThreadNext() {
  if ($("#trigger-hot-topic-thread").length > 0) {
    window.addEventListener("resize", fetch_more_topic_detail_thread, {
      passive: !0,
    });
    window.addEventListener("scroll", fetch_more_topic_detail_thread, {
      passive: !0,
    });
    window.addEventListener("touch", fetch_more_topic_detail_thread, {
      passive: !0,
    });
    window.addEventListener("click", fetch_more_topic_detail_thread, {
      passive: !0,
    });
  }
}

function removeTopicDetailThreadAutoload() {
  window.removeEventListener("resize", fetch_more_topic_detail_thread);
  window.removeEventListener("scroll", fetch_more_topic_detail_thread);
  window.removeEventListener("touch", fetch_more_topic_detail_thread);
  window.removeEventListener("click", fetch_more_topic_detail_thread);
  $("#trigger-hot-topic-thread").hide();
}

function fetch_more_topic_detail_thread() {
  var anchor = $("#trigger-hot-topic-thread");
  if (topicDetailThreadLoading || !isElementInViewport(anchor)) {
    return;
  }
  topicDetailThreadLoading = true;
  var cursor = anchor.attr("data-cursor");
  var url = anchor.attr("data-topic-url");
  $.ajax({
    url: KASKUS_URL + "/threadshowcase/show_more/" + url,
    type: "POST",
    data: {
      cursor: cursor,
    },
    xhrFields: {
      withCredentials: true,
    },
    success: function (response) {
      if (typeof response !== "object") {
        response = $.parseJSON(response);
      }

      var threadList = response.threadList;
      if (response.error != 0 || threadList.length == 0) {
        topicDetailThreadLoading = false;
        removeTopicDetailThreadAutoload();
      }

      var templateHtml = $(".hot-topic-base").html();
      var threadListHtml = "";
      var threadImageHtml = "";

      for (var key in threadList) {
        var iconColor =
          "subscribe" == threadList[key].subcriptionState
            ? " C(c-normal)"
            : " C(#f8c31c)";
        var metaImage = threadList[key].metaImage;
        var isSafe = threadList[key].isSafe;
        var threadId = threadList[key].threadId;
        var topicUrl = threadList[key].topicUrl;
        var threadUrlTracking = threadList[key].threadUrlTracking;
        var threadTitleSlug = threadList[key].threadTitleSlug;

        if (metaImage) {
          if (isSafe) {
            threadImageHtml = `
              <div class="W(90px) Fx(flexZero) Mstart(10px) H(90px) Bgz(cv) Bgp(c)">
                <a href="/thread/${threadId}?ref=topic-${topicUrl}&med=thread_list" onclick="${threadUrlTracking}">
                  <img data-src="${metaImage}" class="Bdrs(5px) Bdrsbstart(0) W(100%) oFitCover H(100%) mls-img" alt="${threadTitleSlug}">
                </a>
              </div>`;
          } else {
            threadImageHtml = `
              <div class="W(90px) Fx(flexZero) Mstart(10px) Bdrs(5px) Bgz(cv) Bgp(c) Bdrsbstart(0) H(90px) Ov(h) jsHiddenImage is-active">
                <a href="/thread/${threadId}?ref=topic-${topicUrl}&med=thread_list" onclick="${threadUrlTracking}">
                <div class="Pos(r) W(100%) H(100%) oFitCover D(f) Jc(c) Ai(c) jsHiddenImageContainer">
                  <i class="jsHiddenImageTrigger Pos(a) T(50%) Start(50%) Trf(transformCenter) C(c-white) Fz(32px) far fa-eye-slash Z(1)"></i>
                  <img data-src="${metaImage}" class="Bdrs(5px) Bdrsbstart(0) W(100%) oFitCover H(100%) mls-img" alt="${threadTitleSlug}">
                </div>
                </a>
              </div>`;
          }
        }
        threadListHtml += templateHtml
          .replace(/{{postUserId}}/g, threadList[key].postUserId)
          .replace(/{{postUsername}}/g, threadList[key].postUsername)
          .replace(/{{threadId}}/g, threadId)
          .replace(/{{subcriptionState}}/g, threadList[key].subcriptionState)
          .replace(/{{forumId}}/g, threadList[key].forumId)
          .replace(/{{threadTitle}}/g, threadList[key].threadTitle)
          .replace(/{{threadUrlTracking}}/g, threadUrlTracking)
          .replace(/{{userId}}/g, threadList[key].userId)
          .replace(/{{langSubscription}}/g, threadList[key].langSubscription)
          .replace(/{{threadTitleSlug}}/g, threadTitleSlug)
          .replace(
            /{{langFirstNewPostButton}}/g,
            threadList[key].langFirstNewPostButton
          )
          .replace(/{{threadLastPostId}}/g, threadList[key].threadLastPostId)
          .replace(
            /{{langLastPostButton}}/g,
            threadList[key].langLastPostButton
          )
          .replace(/{{activeUpVoteState}}/g, threadList[key].activeUpVoteState)
          .replace(/{{firstPostId}}/g, threadList[key].firstPostId)
          .replace(/{{vote}}/g, threadList[key].vote)
          .replace(
            /{{activeDownVoteState}}/g,
            threadList[key].activeDownVoteState
          )
          .replace(/{{threadViewCount}}/g, threadList[key].threadViewCount)
          .replace(/{{threadReplyCount}}/g, threadList[key].threadReplyCount)
          .replace(/{{fbSharedUrl}}/g, threadList[key].fbSharedUrl)
          .replace(/{{fbDataUrl}}/g, threadList[key].fbDataUrl)
          .replace(/{{twitterSharedUrl}}/g, threadList[key].twitterSharedUrl)
          .replace(/{{forumName}}/g, threadList[key].forumName)
          .replace(
            /{{topicNameEncoded}}/g,
            encodeURIComponent(threadList[key].topicName)
          )
          .replace(/{{forumParentId}}/g, threadList[key].forumParentId)
          .replace(/{{forumParentName}}/g, threadList[key].forumParentName)
          .replace(/{{channelId}}/g, threadList[key].channelId)
          .replace(/{{channelName}}/g, threadList[key].channelName)
          .replace(/{{whatsappSharedUrl}}/g, threadList[key].whatsappSharedUrl)
          .replace(
            /{{fbMessengerSharedUrl}}/g,
            threadList[key].fbMessengerSharedUrl
          )
          .replace(/{{shortThreadUrl}}/g, threadList[key].shortThreadUrl)
          .replace(/{{iconColor}}/g, iconColor)
          .replace(/{{topicName}}/g, threadList[key].topicName)
          .replace(/{{topicId}}/g, threadList[key].topicId)
          .replace(/{{threadImageHtml}}/g, threadImageHtml)
          .replace(/{{topicUrl}}/g, topicUrl)
          .replace(
            /{{showGotoFirstNewPost}}/g,
            threadList[key].showGotoFirstNewPost
          )
          .replace(/{{showGotoLastPost}}/g, threadList[key].showGotoLastPost);
      }
      $("#threadlist_visualita .hot-topic-base").before(threadListHtml);
      anchor.attr("data-cursor", response.nextCursor);
      topicDetailThreadLoading = false;
      bindSubscribeButton();
      bindOpenWhoPosted();
      bindJsTippy();
      if (threadList.length > 0) {
        _gaq &&
          _gaq.push([
            "_trackEvent",
            "topic detail",
            "load more",
            threadList[key].topicName.toLowerCase(),
          ]);
        dataLayer &&
          dataLayer.push({
            event: "trackEvent",
            "eventDetails.category": "topic detail",
            "eventDetails.action": "load more",
            "eventDetails.label": threadList[key].topicName.toLowerCase(),
          });
      }
      $(".mls-img").kslzy(300);
    },
    error: function () {
      topicDetailThreadLoading = false;
      removeTopicDetailThreadAutoload();
    },
  });
}

function createHorizontalShareMenu(elShareBar) {
  var shareDataEl = elShareBar.find(".jsShareData");
  if (shareDataEl.attr("data-created") == "false") {
    var fb_href = shareDataEl.attr("data-fb-href");
    var fb_url = shareDataEl.attr("data-fb-url");
    var twitter_href = shareDataEl.attr("data-twitter-href");
    var threadid = shareDataEl.attr("data-threadid");
    var forum_id = shareDataEl.attr("data-forum-id");
    var title = decodeURIComponentSafe(shareDataEl.attr("data-title")).replace(
      "&#92;",
      ""
    );
    var wa_href = shareDataEl.attr("data-wa-href");
    var fb_msg_href = shareDataEl.attr("data-fb-msg-href");
    var thread_short_url = shareDataEl.attr("data-short-thread-url");

    if (shareDataEl.attr("data-type") == "hot-topic-detail") {
      var font_size = "Fz(15px)";
      var custom_dimension = {
        topicName: shareDataEl.attr("data-topic-name"),
        topicId: shareDataEl.attr("data-topicid"),
      };
      var category = "topic detail";
    } else {
      var font_size = "Fz(18px)";
      var custom_dimension = {};
      var category = forum_id + " " + title;
    }
    var elString =
      '<a target="_blank" href="' +
      fb_href +
      '" data-url="' +
      fb_url +
      '" data-threadid="' +
      threadid +
      '" onclick="threadlist_facebook_share(\'' +
      fb_url +
      "', '" +
      threadid +
      "');" +
      build_ga_custom_track_share_thread(
        category,
        "share thread",
        "facebook",
        shareDataEl,
        custom_dimension
      ) +
      ';return false;" class="C(c-facebook) C(c-facebook-hover):h Mend(15px) ' +
      font_size +
      '" >' +
      '<i class="fab fa-facebook-f"></i>' +
      "</a>" +
      '<a target="_blank" href="' +
      fb_msg_href +
      '" data-threadid="' +
      threadid +
      '" onclick="threadlist_share_count(\'' +
      threadid +
      "', 'facebook-messenger');" +
      build_ga_custom_track_share_thread(
        category,
        "share thread",
        "facebook-messenger",
        shareDataEl,
        custom_dimension
      ) +
      '" class="C(c-facebook-messenger) C(c-facebook-messenger-hover):h Mx(15px) ' +
      font_size +
      '">' +
      '<i class="fab fa-facebook-messenger"></i>' +
      "</a>" +
      '<a target="_blank" href="' +
      wa_href +
      '" data-threadid="' +
      threadid +
      '" onclick="threadlist_share_count(\'' +
      threadid +
      "', 'whatsapp');" +
      build_ga_custom_track_share_thread(
        category,
        "share thread",
        "whatsapp",
        shareDataEl,
        custom_dimension
      ) +
      '" class="C(c-whatsapp) C(c-whatsapp-hover):h Mx(15px) ' +
      font_size +
      '">' +
      '<i class="fab fa-whatsapp"></i>' +
      "</a>" +
      '<a target="_blank" href="' +
      twitter_href +
      '" data-threadid="' +
      threadid +
      '" onclick="threadlist_share_count(\'' +
      threadid +
      "', 'twitter');" +
      build_ga_custom_track_share_thread(
        category,
        "share thread",
        "twitter",
        shareDataEl,
        custom_dimension
      ) +
      '" class="C(c-twitter) C(c-twitter-hover):h Mx(15px) ' +
      font_size +
      '"> ' +
      '<i class="fab fa-twitter"></i>' +
      "</a>" +
      '<input class="shared_url' +
      threadid +
      '" type="hidden" value="' +
      thread_short_url +
      '">' +
      '<a href="javascript:void(0);" onclick="shareUrl(\'' +
      threadid +
      "');" +
      build_ga_custom_track_share_thread(
        category,
        "share thread",
        "link",
        shareDataEl,
        custom_dimension
      ) +
      '" class="copy_button' +
      threadid +
      " C(c-primary) C(c-tertiary):h Mx(15px) " +
      font_size +
      '">' +
      '<i class="far fa-link"></i>' +
      "</a>";
    shareDataEl.attr("data-created", "true");
    elShareBar.find(".shareBar-list").append(elString);
  }
}

function shareUrl(id) {
  new ClipboardJS(".copy_button" + id, {
    text: function () {
      return document.querySelector(".shared_url" + id).value;
    },
  });

  showBottomToast("Link Tersalin", 2000);
}


var messaging = '';
var config;
var firebaseInitStatus = false;
$(document).ready(function() {
  config = {
    apiKey: WEB_PUSH_API_KEY,
    authDomain: WEB_PUSH_AUTH_DOMAIN,
    databaseURL: WEB_PUSH_DATABASE_URL,
    projectId: WEB_PUSH_PROJECT_ID,
    storageBucket: WEB_PUSH_STORAGE_BUCKET,
    messagingSenderId: WEB_PUSH_MESSAGING_SENDER_ID,
    appId: WEB_PUSH_APP_ID
  };
  try {
    firebase.initializeApp(config);
    messaging = firebase.messaging();
    messaging.usePublicVapidKey(WEB_PUSH_CERTIFICATE);

    messaging.onMessage(function(payload) {
      let notificationTitle = payload.data.title;
      let notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon,
        image: payload.data.image,
        badge: PUSH_NOTIFICATION_BADGE,
        tag: payload.data.tag,
        renotify: true,
        data: {
          click_action: payload.data.url
        }
      };

      navigator.serviceWorker.ready.then(function(registration) {
        return registration.showNotification(notificationTitle, notificationOptions);
      });
    });

    messaging.onTokenRefresh(function() {
      messaging.getToken().then((refreshedToken) => {
        setTokenSentToServer(false);
        sendTokenToServer(refreshedToken);
        getRegistrationToken();
      }).catch((err) => {
        console.log('Unable to retrieve refreshed token ', err);
      });
    });
    bindRequestFcm();
    registerServiceWorker();
    firebaseInitStatus = true;
  } catch (e) {
  }
});

if ('permissions' in navigator) {
  navigator.permissions.query({name:'notifications'}).then(function(notificationPerm) {
    notificationPerm.addEventListener('change', function () {
        if (notificationPerm.state == "granted") {
            getRegistrationToken();
        }
    });
  });
}

function registerServiceWorker() {
  navigator.serviceWorker.register(KASKUS_URL + '/firebase-messaging-sw.js')
  .then(function(reg) {
    messaging.useServiceWorker(reg);
    if (Notification.permission == "granted") {
      getRegistrationToken();
    }
  })
  .catch(function(error) {
    console.error('Service Worker registration error : ', error);
  });
}

function getRegistrationToken() {
  messaging.getToken().then(function(token) {
    if (token) {
      sendTokenToServer(token);
      if (token != getCookie('fcm_token')) {
        subscribeTopic(token);
      }
    } else {
      setTokenSentToServer(false);
    }
  }).catch(function(err) {
    console.log('An error occurred while retrieving token. ', err);
  });
}

function subscribeTopic(fcm_token) {
  $.ajax({
    url: KASKUS_URL + '/misc/generateSecurityToken',
    type: 'GET',
    xhrFields: {
      withCredentials: true
    },
    success: function(result){
      if (typeof result !== 'object') {
        result = $.parseJSON(result);
      }
      $.ajax({
        url: KASKUS_URL + '/user/subscribeDefaultTopic',
        type: 'POST',
        data: {
          fcm_token: fcm_token,
          securitytoken: result.securitytoken
        },
        xhrFields: {
          withCredentials: true
        },
        success: function(result){
          if (typeof result !== 'object') {
            result = $.parseJSON(result);
          }
          return result;
        },
        error: function(xhr){}
      });
      return result;
    },
    error: function(xhr){}
  });
}

function requestPerm() {
  Notification.requestPermission().then(function(permission) {
    $('.request_fcm_section').addClass('D(n)');
  }).catch(function(err) {
    console.log('Unable to get permission to notify.', err);
  });
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
  return "";
}

function sendTokenToServer(currentToken) {
  if (!isTokenSentToServer()) {
    setTokenSentToServer(true);
  } else {
    // console.log('Token already sent to server so won\'t send it again unless it changes');
  }

}

function isTokenSentToServer() {
  return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
  window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function show_request_fcm_popup() {
  if (!("Notification" in window)) {
    // do something if browser does not support desktop notification
  } else if (Notification.permission === "default" && firebaseInitStatus == true) {
     $('.request_fcm_section').removeClass('D(n)');
  }
}

function bindRequestFcm() {
  $('.request_fcm').unbind('click').click(function () {
    requestPerm();
  });
}


// @codekit-prepend "../backend/backend-subforum.js";
// @codekit-prepend "../backend/backend-thread.js";
// @codekit-prepend "../backend/backend-user.js";
// @codekit-prepend "../backend/backend-visualita.js";
// @codekit-prepend "../backend/backend-pushnotification.js";

var catLoaded,
  retryFetch = true;

//share fb
function threadlist_facebook_share(url, data_threadid) {
  FB.ui(
    {
      method: "share",
      href: url,
    },
    function (response) {
      if (response && !response.error_code) {
        threadlist_share_count(data_threadid, "facebook");
      }
    }
  );

  return false;
}

//share count
function threadlist_share_count(threadId, shareType) {
  $.ajax({
    url: KASKUS_URL + "/misc/update_share_count",
    type: "POST",
    data: {
      share_type: shareType,
      thread_id: threadId,
    },
    xhrFields: {
      withCredentials: true,
    },
    success: function (resp) {},
    error: function (xhr) {},
  });
}

function printDiv(divId) {
  window.frames["print_frame"].document.body.innerHTML =
    document.getElementById(divId).innerHTML;
  window.frames["print_frame"].window.focus();
  window.frames["print_frame"].window.print();
}

// notice

function notice(text, timeout) {
  if (typeof timeout === "undefined") {
    timeout = 3000;
  }

  if (document.notice_tid) {
    clearTimeout(document.notice_tid);
  }

  $("#notice_span").html(text);
  $("#floating_notice").show();
  document.notice_tid = setTimeout(function () {
    $("#floating_notice").fadeOut();
  }, timeout);
}

function printContent(el) {
  var restorepage = document.body.innerHTML;
  var printcontent = document.getElementById(el).innerHTML;
  document.body.innerHTML = printcontent;
  window.print();
  document.body.innerHTML = restorepage;
}

function show_signin_popup() {
  $.ajax({
    url: "/user/login/",
    success: function (a) {
      $("#jsModalSignin .modal-body").html(a), $("#username").focus();
    },
  });
}

function show_signup_popup() {
  $.ajax({
    url: "/register/index/",
    success: function (a) {
      $("#jsModalSignin .modal-body").html(a), $("#signup_email").focus();
    },
  });
}

//SEARCH

var ten_minutes = 600;
var one_second = 1;
var local_search_history_date;
var local_search_history;
var local_top_keyword_date;
var local_top_keyword;
var local_search_thread_snippet_date = {};
var local_search_thread_snippet = {};
var indexSelected = -1;
var last_process_time = 0;
var last_search_history;
var last_top_keyword;

function get_search_dropdown() {
  var time_now = Date.now() / 1000;
  if (parseFloat(last_process_time) + one_second > time_now) return;

  last_process_time = time_now;

  get_top_keyword();
  get_search_history();
  show_search_drop_down();
  bindOnClickSearchButton();
  showEmptySearchResultMessage();
}

function show_search_drop_down() {
  var data_top_keyword = get_term_local_data("top_keyword");
  var data_search_history = get_cookie_term_local_data(
    "search_history_" + user_id
  );

  show_template_search(
    data_top_keyword,
    "top_search_choice",
    "#top_search",
    "last_top_keyword"
  );
  show_template_search(
    data_search_history,
    "history_search_choice",
    "#history_search",
    "last_search_history"
  );

  bindJsSearchResultHover();
  bindJsSearchResultMouseDown();
}

function show_template_search(terms, div_id, div_to_hide, last_data) {
  var temp_template = "";
  for (var i in terms) {
    temp_template +=
      '<li><a href="javascript:void(0);" class="D(b) P(4px) C(c-primary) Fz(14px) Td(n):h Bgc(c-gray-1):h resultTerm">' +
      terms[i] +
      "</a></li>";
  }

  if (temp_template != window[last_data]) {
    document.getElementById(div_id).innerHTML = temp_template;
    window[last_data] = temp_template;
    indexSelected = -1;
  }
  if (temp_template == "") {
    if (div_to_hide == "#history_search") {
      $(div_to_hide).parent().hide();
    }
    $(div_to_hide).hide();
  } else {
    if (div_to_hide == "#history_search") {
      $(div_to_hide).parent().show();
    }
    $(div_to_hide).show();
  }
}

function bindJsSearchResultHover() {
  $(".jsSearchResult li")
    .unbind("hover")
    .bind("hover", function (event) {
      $(".jsSearchResult").find("li.is-selected").removeClass("is-selected");
      $(this).addClass("is-selected");
      indexSelected = $(".jsSearchResult li").index($(this));
    });
}

function bindJsSearchResultMouseDown() {
  $(".jsSearchResult li")
    .unbind("mousedown")
    .bind("mousedown", function (e) {
      e.preventDefault();
      $("#searchform").removeAttr("data-url");
      if ($(this).find("a").hasClass("categorySearch")) {
        var fidterm = $(this).find("a").attr("data-term");
        if ($(this).find("a").attr("data-forum-id") !== undefined) {
          fidterm += " fid:" + $(this).find("a").attr("data-forum-id");
        }
        $("#search").val(fidterm);
      } else if (
        $(this).find("a").hasClass("forumSearch") ||
        $(this).find("a").hasClass("threadSnippetSearch")
      ) {
        if ($(this).find("a").attr("data-url") !== undefined) {
          url = $(this).find("a").attr("data-url");
          $("#searchform").attr("data-url", url);
        }
      } else {
        $("#search").val($(this).text());
      }
      $("#btn-search").click();
    });
}

function bindSearchAllThreadOnClick() {
  $(".jsSearchResult #search_thread_button")
    .unbind("mousedown")
    .bind("mousedown", function (e) {
      e.preventDefault();
      window.location.href = "/search/forum?q=" + $("#search").val();
    });
}
function bindOnClickSearchButton() {
  $("#btn-search")
    .unbind("click")
    .bind("click", function (e) {
      if ($("#searchform").attr("data-url") !== undefined) {
        e.preventDefault();
        url = $("#searchform").attr("data-url");
        window.location.href = url;
      }
    });
}

function get_top_keyword() {
  var top_keyword_date = null;
  if (localStorage) {
    top_keyword_date = parseFloat(localStorage.getItem("top_keyword_date"));
  } else {
    top_keyword_date = local_top_keyword_date;
  }
  var date_now = Date.now() / 1000;
  if (isNaN(top_keyword_date) || top_keyword_date + ten_minutes < date_now) {
    $.ajax({
      url: "/misc/get_top_keyword",
      success: function (a) {
        if (localStorage) {
          localStorage.setItem("top_keyword", a);
          localStorage.setItem("top_keyword_date", Date.now() / 1000);
        } else {
          local_top_keyword = JSON.parse(a);
          local_top_keyword_date = Date.now() / 1000;
        }

        show_search_drop_down();
      },
      error: function () {
        show_search_drop_down();
      },
    });
  }
}

function get_search_history() {
  var search_history_date = parseFloat(
    $.cookie("search_history_date_" + user_id)
  );
  var date_now = Date.now() / 1000;

  if (
    isNaN(search_history_date) ||
    search_history_date + ten_minutes < date_now
  ) {
    $.ajax({
      url: "/misc/get_search_history",
      success: function (a) {
        var cookie_domain = "";
        if (typeof KASKUS_COOKIE_DOMAIN !== "undefined")
          cookie_domain = KASKUS_COOKIE_DOMAIN;
        else cookie_domain = COOKIE_DOMAIN;
        date_now = Date.now() / 1000;

        $.cookie("search_history_" + user_id, a, {
          expires: date_now + ten_minutes,
          path: "/",
          domain: cookie_domain,
          secure: false,
        });
        $.cookie("search_history_date_" + user_id, date_now, {
          expires: date_now + ten_minutes,
          path: "/",
          domain: cookie_domain,
          secure: false,
        });

        show_search_drop_down();
      },
      error: function () {
        show_search_drop_down();
      },
    });
  }
}

function get_term_local_data(key) {
  var data = {};
  if (localStorage) {
    data = localStorage.getItem(key);
    if (data) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = {};
      }
    }
  } else {
    data = window["local_" + key];
  }

  return data ? data : {};
}

function get_cookie_term_local_data(key) {
  var data = $.cookie(key);
  try {
    data = JSON.parse(data);
  } catch (e) {
    data = {};
  }
  return data;
}

function remove_search_history() {
  $.ajax({
    url: "/misc/remove_search_history",
    success: function () {
      var cookie_domain = "";
      if (typeof KASKUS_COOKIE_DOMAIN !== "undefined")
        cookie_domain = KASKUS_COOKIE_DOMAIN;
      else cookie_domain = COOKIE_DOMAIN;
      date_now = Date.now() / 1000;
      $.cookie("search_history_" + user_id, "[]", {
        expires: date_now + ten_minutes,
        path: "/",
        domain: cookie_domain,
        secure: false,
      });
      $.cookie("search_history_date_" + user_id, date_now, {
        expires: date_now + ten_minutes,
        path: "/",
        domain: cookie_domain,
        secure: false,
      });

      show_search_drop_down();
    },
  });
}

function fetchCategories(fromSearchBox = false) {
  var url = KASKUS_URL + "/misc/get_categories/" + catVersion;
  $.retrieveJSON(
    url,
    {},
    function (a) {
      if (retryFetch && a.version != catVersion) {
        $.clearJSON(url, {});
        retryFetch = false;
        fetchCategories(fromSearchBox);
      } else if (fromSearchBox == false) {
        $("#cat-forum").replaceWith(a.forum);
        $("#cat-promoted").replaceWith(a.promoted);
        catLoaded = true;

        var liSelected, valscroll;
        $("#filter-cat-forum").bind("keydown keyup", function (event) {
          var li = $("#update-tag ul.sidebar-category").find("li");
          // if keydown
          if (event.which === 40) {
            if (event.type === "keydown") {
              if (liSelected) {
                liSelected.removeClass("selected");
                next = liSelected.next();
                if (next.length > 0) {
                  liSelected = next.addClass("selected");
                } else {
                  liSelected.addClass("selected");
                }
              } else {
                liSelected = li.eq(0).addClass("selected");
              }
            }
            valscroll =
              $(".scrolling-con-update ul li.selected").position().top - 140;
            // $('.mCSB_container').attr('style', 'position:relative;top:-'+ valscroll +'px;');
            // if keyup
          } else if (event.which === 38) {
            if (event.type === "keydown") {
              if (liSelected) {
                liSelected.removeClass("selected");
                next = liSelected.prev();
                if (next.length > 0) {
                  liSelected = next.addClass("selected");
                } else {
                  liSelected.addClass("selected");
                }
              } else {
                liSelected = li.last().addClass("selected");
              }
            }
            //valscroll = ( $(".scrolling-con-update ul li.selected").position().top ) - 140;
            //$('.mCSB_container').attr('style', 'position:relative;top:-'+ valscroll +'px;');
            // presss enter get redirect URL
          } else if (event.which === 13) {
            if ($(".scrolling-con-update").find("li.selected").length > 0) {
              window.location = $(
                ".scrolling-con-update li.selected .categories-title"
              )
                .children("a")
                .attr("href");
            }
          } else {
            // keyup get data json and append listing data
            if (event.type === "keyup") {
              $("#update-tag ul.sidebar-category")
                .find("li")
                .removeClass("selected");
              searchField = $("#filter-cat-forum").val();
              $(".flyout__search i").removeClass("fa-search");
              $(".flyout__search i").addClass("fa-times");
              // close filter categories
              $("#jsCategoryTabForum .flyout__search i.fa-times").click(
                function (event) {
                  $(this).removeClass("fa-times");
                  $(this).addClass("fa-search");

                  $("#filter-cat-forum").val("");
                  $("#update-tag").html("");
                  $("#update-tag").addClass("hide");
                }
              );
              try {
                myExp = new RegExp(searchField, "i");
                if (searchField === "") {
                  $("#update-tag").addClass("hide");
                  $("#jsCategoryTabForum .flyout__search i").removeClass(
                    "fa-times"
                  );
                  $("#jsCategoryTabForum .flyout__search i").removeClass(
                    "fa-search"
                  );

                  return false;
                }
                $.retrieveJSON(
                  urlCatJSON,
                  {
                    usergroupid: userGroupIdJSON,
                  },
                  function (data) {
                    $("#update-tag").removeClass("hide");
                    //heightUpdateContent = $('.tag-wrap').height() - 28;
                    //$('#update-tag').children('.scrolling-con-update').height(heightUpdateContent);
                    output =
                      '<ul class="flyout__result__list"><div class="flyout__scroll flyout__scroll--up"><i class="fa fa-chevron-up"></i></div>';
                    $.each(data, function (key, val) {
                      if (val.forum_name.search(myExp) != -1) {
                        output += '<li class="flyout__result__item">';
                        output +=
                          '<a class="flyout__result__link" href="' +
                          decodeURIComponent(val.forum_url) +
                          '">';
                        output +=
                          '<img src="' +
                          decodeURIComponent(val.forum_icon) +
                          '" alt="" width="20" height="20" ><span>' +
                          decodeURIComponent(val.forum_name);
                        output += "</span></a>";
                        output += "</li>";
                      }
                    });
                    output +=
                      '<div class="flyout__scroll flyout__scroll--down"><i class="fa fa-chevron-down"></i></div></ul>';
                    $("#update-tag").html(output);
                  },
                  864e5
                );
                liSelected = "";
                checkScroller(".flyout__result__list");
              } catch (err) {
                // console.log(err);
              }
            }
          }
        });

        if (
          $(".flyout__tab__pane > .flyout__category__list").length > 0 &&
          $(".flyout__tab__pane > .flyout__category__list")[0].scrollHeight >
            $(".flyout__tab__pane > .flyout__category__list").height()
        ) {
          $(".flyout__tab__pane > .flyout__category__list")
            .siblings(".flyout__scroll--down")
            .addClass("flyout__scroll--on");
        }
        //scroll top main category nav
        $(".flyout__category__list").bind("scroll", function () {
          checkScroller($(this));
        });

        //scroll top main category search
        $(".flyout__result__list").bind("scroll", function () {
          checkScroller($(this));
        });

        //scroll anakan main category nav
        $(".flyout__category-children__list").bind("scroll", function () {
          checkScroller($(this));
        });
      } else {
        try {
          var searchField = $("#search").val().trim();
          if (searchField == "" || searchField.length < 3) {
            $("#forum_search").addClass("D(n)");
            $("#forum_search").removeClass("Mt(20px)");
            $("#forum_search_choice").addClass("D(n)");
            $("#forum_search_choice").html("");
            return;
          }
          myExp = new RegExp(searchField, "i");
          var url = "/misc/forum_categories/";
          $.retrieveJSON(
            url,
            {
              usergroupid: userGroupIdJSON,
            },
            function (data) {
              var template = "";
              var limit = 3;
              var count = 0;
              $.each(data, function (key, val) {
                if (val.forum_name.search(myExp) != -1 && count < limit) {
                  var forum_url = decodeURIComponent(val.forum_url);
                  var segments = forum_url.split("?");
                  var arr = {};
                  let additional_data_track =
                    "'forumID' : '" +
                    val.forum_id +
                    "', 'forumName' : '" +
                    val.forum_name.replace(/'/g, "'") +
                    "'";
                  let ga_track = build_ga_track_event_custom(
                    "'community interaction'",
                    "'open community'",
                    "'search community'",
                    additional_data_track
                  );
                  arr.ref = "header";
                  arr.med = "search";
                  forum_url = segments[0] + "?" + jQuery.param(arr);
                  template +=
                    `<li>
                  <a data-url="` +
                    forum_url +
                    `" href="javascript:void(0);"
                    class="D(f) Ai(fs) C(c-primary) Fz(14px) Px(4px) Py(6px) Td(n):h Bgc(c-gray-1):h forumSearch"
                    onclick="` +
                    ga_track +
                    `">
                    <img class="W(40px) H(40px) Fx(flexZero) oFitCover" width="40"
                      height="40" src="` +
                    decodeURIComponent(val.forum_icon) +
                    `" alt="` +
                    val.forum_name +
                    `">
                    <div class="Fx(flexOne) Mstart(8px)">
                      <div id="forum_name" class="Fz(14px) C(c-primary) Fw(500) resultTerm">` +
                    val.forum_name +
                    `</div>
                      <div class="Maw(90%) Tov(e) Ov(h) Whs(nw) Mt(4px) C(c-secondary)">
                        ` +
                    val.description +
                    `
                      </div>
                    </div>
                  </a>
                </li>`;
                  count++;
                }
              });
              if (template != "") {
                $("#forum_search_choice").html(template);
                $("#forum_search").removeClass("D(n)");
                $("#forum_search_choice").removeClass("D(n)");
                highlightSearchResult(searchField);
                bindJsSearchResultHover();
                bindJsSearchResultMouseDown();
                insertMarginToSearchResultSections();
              } else {
                $("#forum_search").addClass("D(n)");
                $("#forum_search").removeClass("Mt(20px)");
                $("#forum_search_choice").addClass("D(n)");
                $("#forum_search_choice").html("");
                $("#thread_snippet_search").removeClass("Mt(20px)");
              }
              showEmptySearchResultMessage();
            },
            864e5
          );
        } catch (err) {}
      }
    },
    36e5
  );
}

function fetchThreadSnippets() {
  var searchField = $("#search").val().trim();
  if (searchField == "" || searchField.length < 3) {
    $("#thread_snippet_search").addClass("D(n)");
    $("#thread_snippet_search").removeClass("Mt(20px)");
    $("#thread_snippet_search_choice").addClass("D(n)");
    $("#thread_snippet_search_choice").html("");
    $("#search_thread_button").addClass("D(n)");
    return;
  }
  var thread_snippet_date = null;
  if (localStorage) {
    thread_snippet_date = parseFloat(
      localStorage.getItem("search_thread_snippet_" + searchField + "_date")
    );
  } else {
    thread_snippet_date = local_search_thread_snippet_date[searchField];
  }
  var date_now = Date.now() / 1000;
  if (
    isNaN(thread_snippet_date) ||
    thread_snippet_date + ten_minutes < date_now
  ) {
    var url = "/search/thread_snippet/?q=" + searchField;
    $.get(url, function (result) {
      if (localStorage) {
        localStorage.setItem("search_thread_snippet_" + searchField, result);
        localStorage.setItem(
          "search_thread_snippet_" + searchField + "_date",
          Date.now() / 1000
        );
      } else {
        if (typeof result !== "object") {
          result = $.parseJSON(result);
        }
        local_search_thread_snippet[searchField] = result;
        local_search_thread_snippet_date[searchField] = Date.now() / 1000;
      }
      show_thread_snippets(searchField);
    });
  } else {
    show_thread_snippets(searchField);
  }
}

function show_thread_snippets(searchField) {
  var data_thread_snippet = get_term_local_data(
    "search_thread_snippet_" + searchField
  );
  data_thread_snippet = localStorage
    ? data_thread_snippet
    : local_search_thread_snippet[searchField];
  let template = "";
  if (!data_thread_snippet.error) {
    if (data_thread_snippet.data.length % 2 != 0) {
      data_thread_snippet.data.pop();
    }
    $.each(data_thread_snippet.data, function (key, val) {
      template +=
        `<li><a data-url="` +
        decodeURIComponent(val.url) +
        `" href="javascript:void(0);"
        class="Bgc(c-gray-1):h D(f) Ai(fs) Jc(sb) P(4px) threadSnippetSearch">
        <div id="thread_title" class="Fz(14px) C(c-primary) Mend(8px) resultTerm">` +
        val.title +
        `</div>
        <img class="Bdrs(5px) W(80px) H(80px) Fx(flexZero) oFitCover"
          width="80" height="80" src="` +
        decodeURIComponent(val.image) +
        `" alt="` +
        val.title +
        `">
        </a></li>`;
    });
  }
  if (template != "") {
    $("#thread_snippet_search_choice").html(template);
    $("#thread_snippet_search").removeClass("D(n)");
    $("#thread_snippet_search_choice").removeClass("D(n)");
    $("#search_thread_button").removeClass("D(n)");
    bindSearchAllThreadOnClick();
    highlightSearchResult(searchField);
    bindJsSearchResultHover();
    bindJsSearchResultMouseDown();
    insertMarginToSearchResultSections();
  } else {
    $("#thread_snippet_search").addClass("D(n)");
    $("#thread_snippet_search").removeClass("Mt(20px)");
    $("#thread_snippet_search_choice").addClass("D(n)");
    $("#thread_snippet_search_choice").html("");
    $("#search_thread_button").addClass("D(n)");
  }
  showEmptySearchResultMessage();
}

function insertMarginToSearchResultSections() {
  if (searchSectionExist("#searchPreliminaryResult")) {
    let sections = [
      "#category_search",
      "#forum_search",
      "#thread_snippet_search",
    ];
    let shownSections = [];
    sections.forEach(function (item) {
      if (searchSectionExist(item)) {
        shownSections.push(item);
      }
    });
    if (shownSections.length > 1) {
      for (let i = 1; i < shownSections.length; i++) {
        $(shownSections[i]).addClass("Mt(20px)");
      }
    }
  }
}

function showEmptySearchResultMessage() {
  let countSections = $("#searchPreliminaryResult").children("div").length;
  if (
    !searchSectionExist("#searchInitial") &&
    $("#searchPreliminaryResult").children("div.D\\(n\\)").length ==
      countSections
  ) {
    $("#searchEmptyResult").removeClass("D(n)");
  } else {
    $("#searchEmptyResult").addClass("D(n)");
  }
}

function searchSectionExist(searchSectionDivId) {
  return (
    $(searchSectionDivId).length && !$(searchSectionDivId).hasClass("D(n)")
  );
}

function highlightSearchResult(term) {
  term = term.trim();
  var pattern = new RegExp("(" + escapeRegExp(term) + ")", "gi");
  let searchTerms = document.getElementsByClassName("resultTerm");
  for (var i = 0; i < searchTerms.length; i++) {
    if (pattern.test(searchTerms[i].innerText)) {
      var highlightedTerm = searchTerms[i].innerText.replace(
        pattern,
        function (termVal) {
          return (
            '<span class="highlightedText">' + escapeHtml(termVal) + "</span>"
          );
        }
      );
      searchTerms[i].innerHTML = highlightedTerm;
    } else {
      searchTerms[i].innerHTML = escapeHtml(searchTerms[i].innerText);
    }
  }
}

function gaTrackSubscribeForum(tracks) {
  dataLayer.push(tracks);
}

/**
 * Function buat subscribe unsubscribe thread gaTrack (thread & subforum)
 */
function gaTrackOb(el) {
  var type = el.attr("data-type");
  var category = el.attr("data-category");
  var action = el.attr("data-state");
  var additionalActionTracking = el.attr("data-action-tracking");
  var forumId = el.attr("data-forumid");
  var forumName = el.attr("data-forum-name");
  var forumParentId = el.attr("data-forum-parentid");
  var forumParentName = el.attr("data-forum-parent-name");
  var channelId = el.attr("data-channelid");
  var channelName = el.attr("data-channel-name");
  var totalSubscriber = "-1";
  if (action == "subscribe") {
    totalSubscriber = "1";
  }
  var label = el.attr("data-label");
  var threadId = el.attr("data-id");
  var userId = el.attr("data-userid");
  var threadTitle = el.attr("data-title");
  var author = el.attr("data-author");

  _gaq.push(["_trackEvent", category, action, label]);
  obj = {
    event: "trackEvent",
    "eventDetails.category": category,
    "eventDetails.action": action,
    "eventDetails.label": label,
    threadSubscriber: totalSubscriber,
    userID: userId,
    threadID: threadId,
    threadTitle: threadTitle,
    author: author,
    forumID: forumId,
    forumName: forumName,
    forumParentID: forumParentId,
    forumParentName: forumParentName,
    channelID: channelId,
    channelName: channelName,
  };

  if (el.attr("data-topic-name")) {
    obj["topicName"] = el.attr("data-topic-name");
    obj["topicId"] = el.attr("data-topicid");
    obj["eventDetails.label"] = "thread-" + obj["eventDetails.label"];
  }

  dataLayer.push(obj);
}

function handleCtaJoin(el, result) {
  $("#securitytoken, .sctoken").val(result.securitytoken);
  closeModal("cta-join-" + el.attr("data-forumid"));
}

function sprintfElement(elm, values) {
  // ex for values : {"{{forum_name}}": "Tanaman", "{{forum_id}}": "192"}
  for (var key in values) {
    let updatedElm = elm.html().replaceAll(String(key), String(values[key]));
    elm.html(updatedElm);
  }
}

function showCtaJoin(elm, label = "give reputation") {
  let toReplace = {
    "{{forum_name}}": elm.attr("data-forum-name") ?? "",
    "{{forum_id}}": elm.attr("data-forumid"),
    "{{data_target}}": elm.attr("data-target") ?? "",
  };
  let modalId = "cta-join-" + elm.attr("data-forumid");
  let modalElm;
  if ($jQ("#" + modalId).length > 0) {
    modalElm = $jQ("#" + modalId);
  } else {
    modalElm = $(".cta-join-modal").clone().appendTo("body");
    modalElm.attr("id", modalId);
    modalElm.removeClass("cta-join-modal");
  }
  let tracks = {
    event: "trackEvent",
    "eventDetails.category": "-",
    "eventDetails.action": "intent to join community",
    "eventDetails.label": label,
    forumID: elm.attr("data-forumid"),
    forumName: elm.attr("data-forum-name"),
  };
  gaTrackSubscribeForum(tracks);

  sprintfElement(modalElm, toReplace);
  openModal(modalId);
}

/**
 * Function buat subscribe unsubscribe thread (thread & subforum)
 */

var subscribeUnsubscribeOnProgress = false;
var subscribeUnsubscribeEls = [];

function subscribeUnsubscribe(el) {
  var elmId = el.attr("id");
  var index_el_exist = subscribeUnsubscribeEls.indexOf(elmId);
  if (index_el_exist < 0 && typeof elmId !== "undefined") {
    subscribeUnsubscribeEls.push(el.attr("id"));
  }
  if (subscribeUnsubscribeOnProgress) {
    return;
  }
  subscribeUnsubscribeOnProgress = true;
  var subscribe_to_do = el.attr("data-state");
  var subscribe_option = el.attr("data-type");
  var subscribe_id = el.attr("data-id");
  var subscribe_url =
    "/myforum/" + subscribe_to_do + "/" + subscribe_option + "/" + subscribe_id;
  var securitytoken = $("#securitytoken").val();
  var forum_name = el.data("name");
  var subscribe_category = el.attr("data-category");

  if (securitytoken) {
    $.ajax({
      type: "POST",
      url: subscribe_url,
      data: {
        securitytoken: securitytoken,
      },
      xhrFields: {
        withCredentials: true,
      },
      success: function (result) {
        if (typeof result !== "object") {
          result = $.parseJSON(result);
        }
        let fromCtaJoin = false;
        if (el.attr("data-cta-join") == "true") {
          fromCtaJoin = true;
          handleCtaJoin(el, result);
          const tmpTarget = el.attr("data-target");
          if (tmpTarget.length > 0) {
            el = $jQ(el.attr("data-target"));
          }
        }
        if (result.flag == "TRUE") {
          if (subscribe_option == "thread") {
            gaTrackOb(el);
          } else if (subscribe_option == "forum" && result.ga_tracks) {
            var label = !fromCtaJoin
              ? el.attr("data-label")
              : "join intention modal";
            result.ga_tracks["eventDetails.label"] = label;
            gaTrackSubscribeForum(result.ga_tracks);
            $("#securitytoken").val(result.securitytoken);
          }
          if (subscribe_to_do == "subscribe") {
            $("#securitytoken").val(result.securitytoken);
            el.attr("data-state", "unsubscribe");

            if (el.attr("data-style") == "icon") {
              var iEl = el.find("i:first");
              iEl.addClass("C(#f8c31c)");
              iEl.removeClass(
                "C(c-grey) D(n) listThreadItem:h_D(b) C(#f8c31c):h Cur(p):h is-animate"
              );
            } else if (el.attr("data-style") == "icon-category") {
              var iEl = el.find("i:first");
              iEl.addClass("C(#f8c31c) C(c-grey):h");
              iEl.removeClass(
                "C(c-grey) D(n) listForumItem:h_D(b) C(#f8c31c):h"
              );
            } else if (el.attr("data-style") == "icon-thread") {
              el.attr("title", el.attr("title-unsubscribe"));
              var iEl = el.find("i:first");
              iEl.removeClass("C(c-tertiary)");
              iEl.addClass("C(c-yellow-1)");
              var elementJsSubscribeThreadIcon = document.querySelector(
                ".jsSubscribeThreadIcon"
              );
              var tipJsSubscribeThreadIcon =
                elementJsSubscribeThreadIcon._tippy;
              tipJsSubscribeThreadIcon.setContent(el.attr("title-unsubscribe"));
              showBottomToast("Subscribe Thread Berhasil", 1500);
            } else if (el.attr("data-style") == "icon-thread-visualita") {
              el.find("i").removeClass("C(c-normal)").addClass("C(#f8c31c)");
              var spanEl = el.find("span:first");
              spanEl.text("Unsubscribe");
              showBottomToast("Subscribe Thread Berhasil", 1500);
            } else {
              var spanEl = el.find("span:first");
              spanEl.text("Unsubscribe");
            }
            if (el.data("type") == "forum") {
              if (el.attr("data-style") == "button-forum") {
                var iEl = el.find("i:first");
                iEl.removeClass("C(c-gray-2)");
                iEl.addClass("C(c-yellow-1)");
                var elementJsSubscribeThreadIcon = $(el).find("i");
                var tipJsSubscribeThreadIcon =
                  elementJsSubscribeThreadIcon[0]._tippy;
                tipJsSubscribeThreadIcon.setContent(
                  window.KASKUS_lang.unsubscribe_forum
                );
                iEl.attr(
                  "data-tippy-content",
                  window.KASKUS_lang.unsubscribe_forum
                );
                showBottomToast(
                  window.KASKUS_lang.subscribe_forum_success,
                  1500
                );
              } else if (el.attr("data-style") == "menu-search") {
                var iEl = el.find("i:first");
                iEl.removeClass("C(c-grey) D(n) C(#f8c31c):h");
                iEl.addClass("C(c-grey):h C(#f8c31c)");
              } else if (el.attr("data-style") == "button-card-subscribe") {
                el.removeClass("Bgc(c-blue) Bgc(c-blue-hover):h C(c-white)");
                el.addClass(
                  "Bgc(c-white) Bgc(c-white-blue-hover):h C(c-blue) Bdc(c-blue) Bds(s) Bdw(1px) Fw(500)"
                );
                el.html(result.text_button);
                showBottomToast(result.message_return, 1500);
              } else if (el.attr("data-style") == "solid-button") {
                let cta_temp = el.text();
                el.html(el.attr("data-cta-label"));
                el.attr("data-cta-label", cta_temp);
                el.removeClass(
                  "Bgc(c-blue) Bgc(c-blue-hover):h C(c-white) jsSubscribeThreadIcon"
                );
                el.addClass(
                  "Bgc(c-white) Bgc(c-white-blue-hover):h C(c-blue) Bdc(c-blue) Bds(s) Bdw(1px) jsModalTrigger"
                );
                showBottomToast(result.message_return, 2000);
              } else if (el.attr("data-style") == "hollow-button") {
                let cta_temp = el.text();
                el.text(el.attr("data-cta-label"));
                el.attr("data-cta-label", cta_temp);
                el.removeClass(
                  "Bd(borderSolidBlue1) C(c-blue-1) Bgc(c-white) Bgc(c-white-blue-hover):h jsSubscribeThreadIcon"
                );
                el.addClass(
                  "Bd(borderSolidGray5) Bd(borderSolidGray3) C(c-secondary) jsModalTrigger"
                );
                showBottomToast(result.message_return, 2000);
              } else if (el.attr("data-style") == "remove-after") {
                let removeTarget = $jQ(".ht-subscribe-" + el.attr("data-id"));
                removeTarget.remove();
                showBottomToast(result.message_return, 2000);
              } else if (el.attr("data-cta-join") == "true") {
                showBottomToast(result.message_return, 1500);
                subscribeUnsubscribeOnProgress = false;
              } else {
                var iEl = el.find("i:first");
                iEl.removeClass("C(c-grey) D(n)");
                iEl.addClass("C(#f8c31c)");
              }
            }
          } else {
            el.attr("data-state", "subscribe");
            if (el.attr("data-style") == "icon") {
              var iEl = el.find("i:first");
              iEl.removeClass("C(#f8c31c)");
              iEl.addClass(
                "C(c-grey) D(n) listThreadItem:h_D(b) C(#f8c31c):h Cur(p):h is-animate"
              );
            } else if (el.attr("data-style") == "icon-category") {
              var iEl = el.find("i:first");
              iEl.removeClass("C(#f8c31c)");
              iEl.addClass(
                "C(c-grey) D(n) listForumItem:h_D(b) C(#f8c31c):h Cur(p):h"
              );
            } else if (el.attr("data-style") == "icon-thread") {
              el.attr("title", el.attr("title-subscribe"));
              var iEl = el.find("i:first");
              iEl.removeClass("C(c-yellow-1)");
              iEl.addClass("C(c-tertiary)");
              var elementJsSubscribeThreadIcon = document.querySelector(
                ".jsSubscribeThreadIcon"
              );
              var tipJsSubscribeThreadIcon =
                elementJsSubscribeThreadIcon._tippy;
              tipJsSubscribeThreadIcon.setContent(el.attr("title-subscribe"));
              showBottomToast("Unsubscribe Thread Berhasil", 1500);
            } else if (el.attr("data-style") == "icon-thread-visualita") {
              el.find("i").addClass("C(c-normal)").removeClass("C(#f8c31c)");
              var spanEl = el.find("span:first");
              spanEl.text("Subscribe");
              showBottomToast("Unsubscribe Thread Berhasil", 1500);
            } else if (el.attr("data-style") == "button-join") {
              el.removeClass("Bgc(transparent) C(c-blue)");
              el.addClass("Bgc(c-blue) C(c-white) Bgc(c-blue-hover):h");
              el.html("Gabung");
              showBottomToast("Sukses keluar dari komunitas", 1500);
            } else if (el.attr("data-style") == "remove-element") {
              el.parents(".jsThreadCard").remove();
              showBottomToast(result.message_return, 1500);
            } else {
              var spanEl = el.find("span:first");
              spanEl.text("Subscribe");
            }

            if (el.data("type") == "forum") {
              if (el.attr("data-style") == "button-forum") {
                var iEl = el.find("i:first");
                iEl.removeClass("C(c-yellow-1)");
                iEl.addClass("C(c-gray-2)");
                var elementJsSubscribeThreadIcon = $(el).find("i");
                var tipJsSubscribeThreadIcon =
                  elementJsSubscribeThreadIcon[0]._tippy;
                tipJsSubscribeThreadIcon.setContent(
                  window.KASKUS_lang.subscribe_forum
                );
                iEl.attr(
                  "data-tippy-content",
                  window.KASKUS_lang.subscribe_forum
                );
                showBottomToast(
                  window.KASKUS_lang.unsubscribe_forum_success,
                  1500
                );
              } else if (el.attr("data-style") == "menu-search") {
                var iEl = el.find("i:first");
                iEl.removeClass("C(c-grey):h C(#f8c31c)");
                iEl.addClass("C(c-grey) D(n) C(#f8c31c):h");
              } else if (el.attr("data-style") == "button-card-subscribe") {
                el.removeClass(
                  "Bgc(c-white) Bgc(c-white-blue-hover):h C(c-blue) Bdc(c-blue) Bds(s) Bdw(1px) Fw(500)"
                );
                el.addClass("Bgc(c-blue) Bgc(c-blue-hover):h C(c-white)");
                el.html(result.text_button);
                showBottomToast(result.message_return, 1500);
              } else if (el.attr("data-style") == "solid-button") {
                let cta_temp = el.text();
                el.html(el.attr("data-cta-label"));
                el.attr("data-cta-label", cta_temp);
                el.addClass(
                  "Bgc(c-blue) Bgc(c-blue-hover):h C(c-white) jsSubscribeThreadIcon"
                );
                el.removeClass(
                  "Bgc(c-white) Bgc(c-white-blue-hover):h C(c-blue) Bdc(c-blue) Bds(s) Bdw(1px) jsModalTrigger"
                );
                showBottomToast(result.message_return, 2000);
              } else if (el.attr("data-style") == "hollow-button") {
                let cta_temp = el.text();
                el.text(el.attr("data-cta-label"));
                el.attr("data-cta-label", cta_temp);
                el.removeClass(
                  "Bd(borderSolidGray5) Bd(borderSolidGray3) C(c-secondary) jsModalTrigger"
                );
                el.addClass(
                  "Bd(borderSolidBlue1) C(c-blue-1) Bgc(c-white) Bgc(c-white-blue-hover):h jsSubscribeThreadIcon"
                );
                showBottomToast(result.message_return, 2000);
              } else {
                var iEl = el.find("i:first");
                iEl.removeClass("C(#f8c31c)");
                iEl.addClass("C(c-grey) D(n)");
              }
            }
            if (el.attr("data-thread-subscription") == "true") {
              showHideThreadByModTools([el.attr("data-id")]);
            }
          }
        } else if (result.flag == "FALSE") {
          $("#securitytoken").val(result.securitytoken);
          showBottomToast(result.message_return, 1500);
        } else {
          intentToSignInMetrics(subscribe_to_do + " " + subscribe_option);
          window.location = "/user/login";
        }
        var index_el = subscribeUnsubscribeEls.indexOf(el.attr("id"));
        if (index_el > -1) {
          subscribeUnsubscribeEls.splice(index_el, 1);
        }
        subscribeUnsubscribeOnProgress = false;
        if (subscribeUnsubscribeEls.length > 0) {
          subscribeUnsubscribe($("#" + subscribeUnsubscribeEls[0]));
        }
      },
      error: function (result) {
        var index_el = subscribeUnsubscribeEls.indexOf(el.attr("id"));
        if (index_el > -1) {
          subscribeUnsubscribeEls.splice(index_el, 1);
        }
        subscribeUnsubscribeOnProgress = false;
        if (subscribeUnsubscribeEls.length > 0) {
          subscribeUnsubscribe($("#" + subscribeUnsubscribeEls[0]));
        }
      },
    });
  } else {
    login_userid = user_id;
    if (
      typeof subscribe_category != "undefined" &&
      subscribe_category == "profile"
    ) {
      login_userid = el.attr("data-userid");
    }
    if (typeof login_userid != "undefined" && login_userid.length == 0) {
      intentToSignInMetrics(subscribe_to_do + " " + subscribe_option);
    }
    window.location.href = subscribe_url;
  }
}

function updateForumCategories(el, id_append, forum_name) {
  var element_a = el.parent().find("a");
  var parent_old = el.parent();
  var parent_div = $("<div/>", {
    class: "Pos(r) listForumItem subscribed Bgc(c-lightgrey-2):h My(3px)",
  }).appendTo(id_append);
  $(element_a).appendTo(parent_div);
  $(parent_old).remove();
  parent_div.attr("data-name", forum_name);

  var list_subscribed = $("#subscribed_forum").find(".subscribed").length;

  if (list_subscribed == 0) {
    $("#subscribed_forum > div").remove();
    $("#subscribed_forum").hide();
  }

  // Sorts
  var subscribed_data = $(id_append).find(".subscribed");
  sortCategories(subscribed_data, id_append);
  // Sort
}

function sortCategories(subscribed_data, id_append) {
  subscribed_data.sort(function (a, b) {
    var an = a.getAttribute("data-name");
    var bn = b.getAttribute("data-name");

    if (an > bn) {
      return 1;
    }
    if (an < bn) {
      return -1;
    }
    return 0;
  });

  subscribed_data.detach().appendTo(id_append);
}


$( ".jsFollowingButton" ).hover(
  function() {
    $( this ).find('span').text(($(this).data('hover')));
  }, function() {
    $( this ).find('span').text(($(this).data('default')));
  }
);

$( ".jsButtonFollowingHeader" ).hover(
  function() {
    $( this ).find('span').text(($(this).data('hover')));
    $( this ).find('i').toggleClass('fa-user-times fa-user-minus');
  }, function() {
    $( this ).find('span').text(($(this).data('default')));
    $( this ).find('i').toggleClass('fa-user-times fa-user-minus');
  }
);

$( ".jsButtonBlockedHeader" ).hover(
  function() {
    $( this ).find('span').text(($(this).data('hover')));
    $( this ).find('i').toggleClass('fa-user-lock fa-unlock');
  }, function() {
    $( this ).find('span').text(($(this).data('default')));
    $( this ).find('i').toggleClass('fa-user-lock fa-unlock');
  }
);

// $( ".jsBlockedButton" ).hover(
//   function() {
//     $( this ).text('Unblock');
//   }, function() {
//     $( this ).text('Blocked');
//   }
// );

// $( ".jsUserMenu" )
// 	.mouseover(function() {
//     $(this).find('.jsUserDropdownMenu').toggleClass("is-visible");
//     toggleOverlay();
//   	})
//  	.mouseout(function() {
//     	$(this).find('.jsUserDropdownMenu').toggleClass("is-visible");
//       toggleOverlay();
//   	});

// $( ".jsNotificationMenu" )
// 	.mouseover(function() {
//     $(this).find('.jsNotificationDropdownMenu').toggleClass("is-visible");
//     toggleOverlay();
//   	})
//  	.mouseout(function() {
//     	$(this).find('.jsNotificationDropdownMenu').toggleClass("is-visible");
//       toggleOverlay();
//   	});


// $( ".flyout__trigger" )
// 	.mouseover(function() {
//     	$(".flyout__anchor").show();
//       toggleOverlay();
//
//     	if($('.flyout__tab__pane > .flyout__category__list').length > 0 && $('.flyout__tab__pane > .flyout__category__list')[0].scrollHeight > $('.flyout__tab__pane > .flyout__category__list').height()){
// 	  		$('.flyout__tab__pane > .flyout__category__list').siblings(".flyout__scroll--down").addClass( "flyout__scroll--on" );
// 	  	}
// 	  	if($('.flyout__subscribed__list').length > 0 && $('.flyout__subscribed__list')[0].scrollHeight > $('.flyout__subscribed__list').height()){
// 	  		$('flyout__subscribed__list').siblings(".flyout__scroll--down").addClass( "flyout__scroll--on" );
// 	  	}
//   	})
//  	.mouseout(function() {
//       console.log("wwwwwww");
//     	$(".flyout__anchor").hide();
//       toggleOverlay();
//   	});

    $( ".flyout__trigger" )
      .on( "mouseenter", function() {
		$(".flyout__anchor").show();
		$(this).addClass('is-active');
        toggleOverlay();

      	if($('.flyout__tab__pane > .flyout__category__list').length > 0 && $('.flyout__tab__pane > .flyout__category__list')[0].scrollHeight > $('.flyout__tab__pane > .flyout__category__list').height()){
  	  		$('.flyout__tab__pane > .flyout__category__list').siblings(".flyout__scroll--down").addClass( "flyout__scroll--on" );
  	  	}
  	  	if($('.flyout__subscribed__list').length > 0 && $('.flyout__subscribed__list')[0].scrollHeight > $('.flyout__subscribed__list').height()){
  	  		$('flyout__subscribed__list').siblings(".flyout__scroll--down").addClass( "flyout__scroll--on" );
  	  	}
      })
      .on( "mouseleave", function() {
		$(".flyout__anchor").hide();
		$(this).removeClass('is-active');
        toggleOverlay();
      });

$( ".flyout__content" )
	.mouseenter(function() {
    	$(this).closest(".flyout__anchor").show();
  	})
	.mouseleave(function() {
    	$(this).closest(".flyout__anchor").hide();
  	});

$( ".flyout__category__item--has-children , .flyout__category-children__item--has-children"  )
	.mouseover(function() {
    	$(this).closest(".flyout__content").addClass( "flyout__content--triggered" );
    	if($(this).find('.flyout__category-children__list').first().length > 0 && $(this).find('.flyout__category-children__list').first()[0].scrollHeight > $(this).find('.flyout__category-children__list').first().height()){
	  		$(this).find('.flyout__category-children__list').first().siblings(".flyout__scroll--down").addClass( "flyout__scroll--on" );
	  	}
  	})
  	.mouseout(function() {
    	$(this).closest(".flyout__content").removeClass( "flyout__content--triggered" );
  	});

$( ".flyout__subscribed__anchor" )
	.mouseover(function() {
    	$(this).closest(".flyout__content").addClass( "flyout__content--triggered" );
    	$(this).closest(".flyout__anchor").addClass( "flyout__anchor--subscribed" );
    	if($(this).find('.flyout__subscribed__list').length > 0 && $(this).find('.flyout__subscribed__list')[0].scrollHeight > $(this).find('.flyout__subscribed__list').height()){
	  		$(this).find('.flyout__subscribed__list').siblings(".flyout__scroll--down").addClass( "flyout__scroll--on" );
	  	}
  	})
  	.mouseout(function() {
    	$(this).closest(".flyout__content").removeClass( "flyout__content--triggered" );
    	$(this).closest(".flyout__anchor").removeClass( "flyout__anchor--subscribed" );
  	});

$( ".flyout__subscribed__panel" )
	.mouseover(function() {
    	$(this).siblings(".flyout__subscribed__anchor__link").addClass( "flyout__subscribed__anchor__link--hovered" );
  	})
  	.mouseout(function() {
    	$(this).siblings(".flyout__subscribed__anchor__link").removeClass( "flyout__subscribed__anchor__link--hovered" );
  	});

$( ".flyout__category__panel" )
	.mouseover(function() {
    	$(this).siblings(".flyout__category__link").addClass( "flyout__category__link--hovered" );
    	$(this).siblings(".flyout__category-children__link").addClass( "flyout__category-children__link--hovered" );
  	})
  	.mouseout(function() {
    	$(this).siblings(".flyout__category__link").removeClass( "flyout__category__link--hovered" );
    	$(this).siblings(".flyout__category-children__link").removeClass( "flyout__category-children__link--hovered" );
  	});


var scrolling = false;
function scrollContent(direction,element) {
    var amount = (direction === "up" ? "-=5px" : "+=5px");
    $(element).animate({
        scrollTop: amount
    }, 1, function() {
        if (scrolling) {
            scrollContent(direction,element);
        }
    });
}

$(".flyout__scroll--down")
	.bind("mouseover", function(event) {
    	scrolling = true;
    	scrollContent("down",$(this).siblings(".flyout__category-children__list"));
    	scrollContent("down",$(this).siblings(".flyout__category__list"));
    	scrollContent("down",$(this).siblings(".flyout__result__list"));
    	scrollContent("down",$(this).siblings(".flyout__subscribed__list"));
	})
	.bind("mouseout", function(event) {
    	scrolling = false;
	});

$(".flyout__scroll--up")
	.bind("mouseover", function(event) {
    	scrolling = true;
    	scrollContent("up",$(this).siblings(".flyout__category-children__list"));
    	scrollContent("up",$(this).siblings(".flyout__category__list"));
    	scrollContent("up",$(this).siblings(".flyout__result__list"));
    	scrollContent("up",$(this).siblings(".flyout__subscribed__list"));
	})
	.bind("mouseout", function(event) {
    	scrolling = false;
	});


$(window).bind('scroll', function () {
  //scrollHeader();

  //PositionBackToTop();

  if ($('.jsLeaderboardSkyscrapper').length) {
    scrollSkyscrapper();
  }
  scrollHeaderSticky();
  //checkStickySubforumSidebar();
  scrollTooltipReputation();
  if ($('.postItemFirst').length > 0) {
    stickyShare();
  }

  scrollModerationTool();


});

// function scrollHeader() {
//     var topHeaderPosition;
//
//     if($('.jsNoticeHeader').length > 0){
//
//         if($(window).scrollTop() <  $('.jsNoticeHeader').outerHeight()){
//             topHeaderPosition = $('.jsNoticeHeader').outerHeight() - $(window).scrollTop();
//         }
//         else{
//             topHeaderPosition = 0;
//         }
//         $('.jsNavHeader').css('top', topHeaderPosition + 'px');
//     }
// }
// 

function scrollModerationTool() {
    $('.jsModerationTool').css('top', '58px');
}

function scrollTooltipReputation() {
  var scrollHeight = $(window).height();
  var scrollTop = $(window).scrollTop();
  var tooltipAnchor = $('.firstPostBot').offset();
  if ($('.firstPostBot').length > 0) {
    if (scrollTop > tooltipAnchor.top - scrollHeight + 64) {
      $('.jsTooltipReputation').addClass("is-visible");
    }
  }
}

var positionOverlayHeader;
var onTop = true;

function scrollHeaderSticky() {
  var batasScrollHeader = $('.jsNavHeader').offset().top + $('.jsNavHeader').height();
  if ($(window).scrollTop() > (batasScrollHeader)) {

    // $(".jsSearchSticky").removeClass("is-clicked");
    // $('.jsSearchOutterWrapper').hide();
    // $(".jsSearchOutterWrapper").appendTo(".jsSearchSticky");

    $(".expandSearch form").appendTo(".expandSearchSticky");

    $('.jsStickyHeader').css('transform', 'translateY(0px)');
    positionOverlayHeader = 0;
    $('.jsFlyoutAnchor').appendTo('.jsFlyoutTriggerSticky');
    $('.jsUserDropdownMenu').appendTo('.jsUserAnchorSticky');
    $('.jsNotificationDropdownMenu').appendTo('.jsNotificationAnchorSticky');

    if ($(".jsSearchFormInput").is(":focus")) {
      $('.jsSearchFormInput').blur();
    }

    $('.jsSearchFormInput').blur();

  }
  else {
    $(".searchResult").hide()
    $(".searchInput").css("width","28px")
    $(".searchIcon, .searchIconSticky").show()
    $(".jsSearchContainer").css("display","none")
    $(".jsNavHeaderOverlay").hide();
    $(".expandSearchSticky form").appendTo(".expandSearch");
    
    // $(".jsSearchSticky, .jsSearchTrigger").removeClass("is-clicked");
    // $(".jsSearchOutterWrapper").appendTo(".jsSearchTrigger");
    $('.jsStickyHeader').css('transform', 'translateY(-200px)');
    //positionOverlayHeader = $('.jsNavHeader').offset().top + 90 - $(window).scrollTop();
    $('.jsFlyoutAnchor').appendTo('.jsFlyoutTrigger');
    $('.jsUserDropdownMenu').appendTo('.jsUserAnchor');
    $('.jsNotificationDropdownMenu').appendTo('.jsNotificationAnchor');
  }
  //console.log(positionOverlayHeader);
}

function scrollSkyscrapper() {
  var batasAtasWrapperAds = $('.jsLeaderboardSkyscrapper').offset().top;
  var tinggiNavHeader = $('.jsStickyHeader').height();
  var tinggiSkyscrapper = 600;
  var tinggiMainContent = $('.jsMainContent').outerHeight(true);

  var tinggiLeaderboard =
    ($('.jsLeaderboardAds').length) ? $('.jsLeaderboardAds').outerHeight(true) : 0;

  var tinggiNoticeBoard =
    ($('.jsNoticeBoard').length) ? $('.jsNoticeBoard').outerHeight(true) * $('.jsNoticeBoard').length : 0;

  var tinggiBreadCrumb =
    ($('.jsBreadcrumb').length) ? $('.jsBreadcrumb').outerHeight(true) : 0;

  var tinggiBottomLeaderboard =
    ($('.jsBottomLeaderboardAds').length) ? $('.jsBottomLeaderboardAds').outerHeight(true) : 0;

  var spacingBawah = 30;
  var spacingAtas = 10;
  var posisiFixed = tinggiNavHeader + spacingAtas;

  var posisiAbsolute = tinggiMainContent + tinggiBottomLeaderboard + tinggiLeaderboard + tinggiNoticeBoard + tinggiBreadCrumb - tinggiSkyscrapper;
  var batasAtasFooter = $('.jsMainFooter').offset().top;
  var batasHarusFixed = batasAtasWrapperAds - tinggiNavHeader - spacingAtas;
  var batasHarusAbsolute = batasAtasFooter - tinggiSkyscrapper - posisiFixed - spacingBawah;

  //kondisi harus sticky
  if ($(window).scrollTop() > batasHarusFixed) {
    //console.log(tinggiMainContent );
    $('.jsSkyscrapperAds').css('position', 'fixed');
    $('.jsSkyscrapperAds').css('transform', 'translateY(' + posisiFixed + 'px)');
    //kondisi harus absolute
    if ($(window).scrollTop() > batasHarusAbsolute) {
      $('.jsSkyscrapperAds').css('position', 'absolute');
      $('.jsSkyscrapperAds').css('transform', 'translateY(' + posisiAbsolute + 'px)');
    }
  }
  //kondisi awal
  else {
    $('.jsSkyscrapperAds').css('position', 'initial');
    $('.jsSkyscrapperAds').css('transform', 'none');
  }
}

/*
function buat subforum fixed sidebar
 */
function checkStickySubforumSidebar() {
  var scrollToFixed;
  var anchorMainContent = $('.jsMainContent').offset().top;
  var heightMainContent = $('.jsMainContent').outerHeight();
  var heightSidebar = $('.jsSubforumFixedSidebar').outerHeight();
  if ($(window).scrollTop() > (anchorMainContent - 50)) {
    //$('.jsSubforumFixedSidebar').css("transform", 'translateY(60px)');
    $('.jsSubforumFixedSidebar').css("top", '50px');
    if ($(window).scrollTop() > (anchorMainContent + heightMainContent - heightSidebar - 50)) {
      scrollToFixed = (anchorMainContent + heightMainContent) - $(window).scrollTop() - (heightSidebar);
      $('.jsSubforumFixedSidebar').css('top', scrollToFixed + 'px');
    }
  }
  else {
    scrollToFixed = ($('.jsMainContent').offset().top - $(window).scrollTop());
    $('.jsSubforumFixedSidebar').css('top', scrollToFixed + 'px');
  }
}

function checkScroller(element) {
  if (element[0].scrollHeight > element.height()) {
    // mentok bawah
    if (element[0].scrollHeight - element.scrollTop() == element.outerHeight()) {
      element.siblings(".flyout__scroll--down").removeClass("flyout__scroll--on");
    }
    // mentok atas
    else if (element.scrollTop() === 0) {
      element.siblings(".flyout__scroll--up").removeClass("flyout__scroll--on");
    }
    else {
      element.siblings(".flyout__scroll--down").addClass("flyout__scroll--on");
      element.siblings(".flyout__scroll--up").addClass("flyout__scroll--on");
    }

  }
}

//scroll top main category nav
$(".flyout__category__list").bind('scroll', function () {
  checkScroller($(this));
});

$(".flyout__subscribed__list").bind('scroll', function () {
  checkScroller($(this));
});

//scroll top main category search
$(".flyout__result__list").bind('scroll', function () {
  checkScroller($(this));
});

//scroll anakan main category nav
$(".flyout__category-children__list").bind('scroll', function () {
  checkScroller($(this));
});


// @codekit-prepend "main/main-kslzy.js";
// @codekit-prepend "main/main-backend.js";
// @codekit-prepend "main/main-hover.js";
// @codekit-prepend "main/main-scroll.js";

function toggleOverlay() {
  if (!($(".jsNavHeaderOverlay").css("display") == "block")) {
    $(".jsNavHeaderOverlay").show();
    $(".jsNavHeaderOverlay").css("top", positionOverlayHeader + "px");
  } else {
    $(".jsNavHeaderOverlay").hide();
  }
}

function showBottomToast(text, time) {
  $(".jsBottomToast").addClass("is-visible");
  $(".jsBottomToast").text(text);
  setTimeout(function () {
    $(".jsBottomToast").removeClass("is-visible");
  }, time);
}

function bindCaretModeratedItem() {
  var deletedThreadCard = document.querySelectorAll(
    ".moderatedPostDetails > details"
  );

  deletedThreadCard.forEach((element) => {
    element.addEventListener("toggle", (event) => {
      var caret = event.target.querySelector(".caretIcon");
      if (event.target.open) {
        caret.classList.add("fa-caret-up");
        caret.classList.remove("fa-caret-down");
      } else {
        caret.classList.add("fa-caret-down");
        caret.classList.remove("fa-caret-up");
      }
    });
  });
}

bindCaretModeratedItem();

function selectBadge(e) {
  $(".jsModal").removeClass("is-open");
  var modalTarget = $(e).attr("data-modal");
  var modalElement = $("#" + modalTarget);
  modalElement.addClass("is-open");
  modalElement.find(".jsModalDialog").addClass("is-animate");
  $("body").addClass("Ov(h)");
  modalElement
    .find(".jsBadgeNumber")
    .text("Pilih Badge " + $(e).attr("data-badgenum"));
}

function bindPopoverMenu() {
  $("body").on("click", ".jsPopoverTrigger", function () {
    var others = $(".jsPopoverTrigger").not(this);
    others.removeClass("C(c-blue)").addClass("C(c-primary)");
    others.next().removeClass("is-visible");
    if ($(this).next().hasClass("is-visible")) {
      $(this).removeClass("C(c-blue)").addClass("C(c-primary)");
      $(this).next().removeClass("is-visible");
    } else {
      $(this).addClass("C(c-blue)").removeClass("C(c-primary)");
      $(this).next().addClass("is-visible");
    }
  });
}

function showReplyTools() {
  $(".jsReplyTools").show();
  $(".jsReplyUser").removeClass("Pos(a)");
  $(".jsReplyUser span").show();
  $(this).removeClass("Px(40px)");
}

function openModal(modalTarget) {
  $(".jsModal").removeClass("is-open");
  var modalElement = $("#" + modalTarget);
  modalElement.addClass("is-open");
  modalElement.find(".jsModalDialog").addClass("is-animate");
  $("body").addClass("Ov(h)");
}

function closeModal() {
  $(".jsModal").removeClass("is-open is-animate");
  $("body").removeClass("Ov(h)");
  resetInputAvatarAndCoverValue();
}

/*
   Function to insert BBCode, it receives 3 parameter. The openWith and closeWith parameters are used to wrap the text with the BBCode tag. The textbox parameter defines which textbox element should be used.
 */
function insertBBCode(openWith, closeWith, textbox) {
  var objectTextbox = document.querySelector(textbox);
  insertBBCodeElement(openWith, closeWith, objectTextbox);
}

function insertBBCodeElement(openWith, closeWith, textbox) {
  var posSelectionStart = textbox.selectionStart;
  var posSelectionEnd = textbox.selectionEnd;
  var textAreaTxt = textbox.value;
  var selection = textAreaTxt.substring(posSelectionStart, posSelectionEnd);
  var txtToAddStart = openWith;
  var txtToAddEnd = closeWith;
  textbox.value =
    textAreaTxt.substring(0, posSelectionStart) +
    txtToAddStart +
    selection +
    txtToAddEnd +
    textAreaTxt.substring(posSelectionEnd);
  textbox.dispatchEvent(new Event("input"));
  textbox.focus();
  textbox.selectionStart =
    posSelectionStart +
    txtToAddStart.length +
    selection.length +
    txtToAddEnd.length;
  textbox.selectionEnd = posSelectionEnd + txtToAddStart.length;
}

function insertBBCodeNoSelection(text, textbox) {
  var posSelectionStart = textbox.selectionStart;
  var posSelectionEnd = textbox.selectionEnd;
  var textAreaTxt = textbox.value;
  var txtToAdd = text;
  textbox.value =
    textAreaTxt.substring(0, posSelectionStart) +
    txtToAdd +
    textAreaTxt.substring(posSelectionEnd);
  textbox.dispatchEvent(new Event("input"));
  textbox.focus();
  textbox.selectionStart = posSelectionStart + txtToAdd.length;
  textbox.selectionEnd = posSelectionEnd + txtToAdd.length;
}

function getSelectedText(textarea, container = document) {
  var textbox = container.querySelector(textarea);
  var text = textbox.value;
  var indexStart = textbox.selectionStart;
  var indexEnd = textbox.selectionEnd;

  return text.substring(indexStart, indexEnd);
}

function createSpoiler(textarea) {
  swal("Masukkan Judul Spoiler:", {
    content: "input",
  }).then((value) => {
    if (value !== null) {
      insertBBCode("[spoiler=" + value + "]", "[/spoiler]", textarea);
    }
  });
}

function createLink(textarea, container = document) {
  var selectedText = getSelectedText(textarea, container);
  var el =
    '<div class="Ta(s)">\
        <div class="Fz(16px) Mb(10px)">URL:</div>\
        <input class="swal-content__input" id="jsLinkInputUrl" placeholder="http://">\
        <div class="Fz(16px) My(10px)">Text to display:</div>\
        <input value="' +
    selectedText +
    '" class="swal-content__input" id="jsLinkMediaInputText" placeholder="Link Url">\
      </div>';
  var elNode = $.parseHTML(el);
  swal({
    content: elNode[0],
    buttons: {
      confirm: {
        value: "",
      },
    },
  }).then((value) => {
    if (value !== null) {
      var linkInput = $("#jsLinkInputUrl").val();
      var linkText = $("#jsLinkMediaInputText").val();

      insertBBCodeNoSelection(
        "[url=" + linkInput + "]" + linkText + "[/url]",
        container.querySelector(textarea)
      );
      $(container).find(".jsCommunityRulesContainer").length &&
        setTimeout(
          () => $(container).find(".jsCommunityRulesContainer")[0].click(),
          0
        );
    }
  });
}

$(".jsBBSpoiler").click(function () {
  createSpoiler(".jsAdvancedReplyTextarea");
});

$(".jsBBLink").click(function () {
  createLink(".jsAdvancedReplyTextarea");
});

$(".jsBBLinkCommunityRules").click(function () {
  createLink(".jsCommunityRulesTextarea");
});

function openBBFontDropdown(button, dropdown) {
  $(button).click(function () {
    if ($(dropdown).is(":visible")) {
      $(dropdown).addClass("D(n)");
      $(button).removeClass("active");
    } else {
      $(".jsBBMention, .jsBBMedia, .jsBBSmilies").removeClass("active");
      $(".jsExtraForm").addClass("D(n)");
      $(dropdown).removeClass("D(n)");
      $(button).addClass("active");
    }
  });
}

function insertBBCodeFont(element, tag, textarea) {
  $(element + " a").click(function () {
    var selectedColor = $(this).data(tag);
    insertBBCode(
      "[" + tag + "=" + selectedColor + "]",
      "[/" + tag + "]",
      textarea
    );
  });
}

openBBFontDropdown(".jsBBFontName", ".jsBBFontPicker");
openBBFontDropdown(".jsBBFontSize", ".jsBBSizePicker");
openBBFontDropdown(".jsBBFontColor", ".jsBBColorPicker");
openBBFontDropdown(".jsBBSmilies", ".jsSmiliesEditor");
openBBFontDropdown(".jsBBMedia", ".jsEmbedMediaForm");

insertBBCodeFont(".jsBBFontPicker", "font", ".jsAdvancedReplyTextarea");
insertBBCodeFont(".jsBBSizePicker", "size", ".jsAdvancedReplyTextarea");
insertBBCodeFont(".jsBBColorPicker", "color", ".jsAdvancedReplyTextarea");

/*
Escape html special chars to display a text to HTML by a javascript function
https://stackoverflow.com/a/4835406/1941694
*/

function escapeHtml(text) {
  var map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

/*
Escape regular expression special characters from a string
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
https://stackoverflow.com/a/9310752
*/
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

$("#search").on("search", function () {
  $("#search").keyup();
});

var updateSearchResult = true;
var regex = /^(.+?)(\d+)$/i;
$(document).on("keyup", "#search", function () {
  var term = $(this).val().trim();
  if ($("#category_search").length) {
    if (term.length > 0) {
      $("#category_search").show();
      var searchHlTerm = document.getElementsByClassName("searchHlTerm");
      for (var j = 0; j < searchHlTerm.length; j++) {
        searchHlTerm[j].innerText = term;
      }
      var categorySearch = document.getElementsByClassName("categorySearch");
      for (var j = 0; j < categorySearch.length; j++) {
        categorySearch[j].setAttribute("data-term", term);
      }
    } else {
      $("#category_search").hide();
    }
  }
  let searchValLength = $("#search").val().trim().length;
  if (updateSearchResult) {
    let minTermLengthToHideSearchInitial =
      $("#category_search").length > 0 ? 0 : 2;
    if (searchValLength > minTermLengthToHideSearchInitial) {
      $("#searchInitial").addClass("D(n)");
      $("#searchPreliminaryResult").removeClass("D(n)");
      $("#searchPreliminaryResult").addClass("D(f)");
      $("#history_search_choice").removeClass("jsSearchWrapper");
      $("#top_search_choice").removeClass("jsSearchWrapper");
      $("#category_search").addClass("jsSearchWrapper");
      $("#forum_search_choice").addClass("jsSearchWrapper");
      $("#thread_snippet_search").addClass("jsSearchWrapper");
      fetchCategories(true);
      clearTimeout(document.threadsnippet_tid);
      document.threadsnippet_tid = setTimeout(function () {
        fetchThreadSnippets();
      }, 500);
    } else if (searchValLength == 0) {
      $("#searchInitial").removeClass("D(n)");
      $("#searchPreliminaryResult").addClass("D(n)");
      $("#searchPreliminaryResult").removeClass("D(f)");
      $("#category_search").removeClass("jsSearchWrapper");
      $("#forum_search_choice").removeClass("jsSearchWrapper");
      $("#thread_snippet_search").removeClass("jsSearchWrapper");
      $("#history_search_choice").addClass("jsSearchWrapper");
      $("#top_search_choice").addClass("jsSearchWrapper");
    }
  }

  highlightSearchResult(term);
  insertMarginToSearchResultSections();
  showEmptySearchResultMessage();
});

/*
 * notice cookie
 */
if ($.cookie("notices") === null) {
  $.cookie("notices", JSON.stringify([]), {
    expires: null,
    path: "/",
    domain: "",
    secure: false,
  });
}
/*
 * general notice
 */
bindNotice();

/*
 * trh in forum landing / threadlist
 */
bindTrhThreadList();

/*
 * trh in home / channel landing
 */
bindTrhHome();

/*
 * set thread display
 */
bindSetThreadDisplay();

/*
 * show list of HT
 */
bindHtNext();

/*
 * set feed display
 */
bindSetFeedDisplay();

/*
 * set subscribed forum order
 */
bindSetSubscribedForumOrder();

/*
 * set subscribed thread tab
 */
bindSetSubscribedThreadTab();

/*
 * set button subscribe
 */
bindSetjsButtonSubscribe();
/**
 * set button feed subscribe
 */
bindSetjsCategoryPersonalizationItem();

/**
 * bind Hot Topic Detail infinite scroll
 */
bindTopicDetailThreadNext();

/**
 * list thread showcase
 */
bindThreadShowcaseNext();

/*
 * show list of thread in forum landing / threadlist
 */
if ($("#threadlist-loading-area").length) {
  function tlload() {
    if (
      isElementInViewport($("#threadlist-loading-area")) &&
      tl_is_loading == false
    ) {
      data_sort = $("#tl_sort").val();
      data_cursor = $("#tl_cursor").val();
      data_order = $("#tl_order").val();
      data_feed = $("#tl_feed").val();
      data_channel = $("#tl_channel").val();
      show_thread_list(
        data_sort,
        data_cursor,
        data_order,
        data_feed,
        data_channel
      );

      tracking_ref = $("#tl_tracking_ref").val();
      data_sort_track = $("#tl_sort_track").val();
      feed_track = $("#feed_track").val();
      dataLayer.push({
        event: "trackEvent",
        "eventDetails.category": tracking_ref,
        "eventDetails.action": "load more " + tl_page,
        "eventDetails.label": feed_track,
        threadListSort: data_sort_track,
      });
    }
  }
  window.addEventListener("resize", tlload, {
    passive: !0,
  });
  window.addEventListener("scroll", tlload, {
    passive: !0,
  });
  window.addEventListener("touch", tlload, {
    passive: !0,
  });
  window.addEventListener("click", tlload, {
    passive: !0,
  });
}

function cloneRepeaterItem() {
  var repeaterItemLength = $(".jsRepeaterItem").length;
  var repeaterIndex = 1;
  $(this)
    .closest(".jsRepeater")
    .find(".jsRepeaterItem")
    .first()
    .clone()
    .hide()
    .appendTo(".jsRepeaterList");
  var clonedItem = $(this)
    .closest(".jsRepeater")
    .find(".jsRepeaterItem")
    .last();
  clonedItem.find(".jsErrorNote").remove();
  clonedItem.find('input[type="text"]').val("");
  clonedItem.slideDown(200);
  //$(this).closest(".jsRepeater").find(".jsRepeaterItem").first().clone().hide().appendTo(".jsRepeaterList").slideDown(200);

  // setTimeout(function(){
  //   $(this).closest(".jsRepeater").find(".jsRepeaterItem").last().find('.jsErrorNote').remove();
  // }, 200);

  if (repeaterItemLength == 2) {
    $(".jsRepeaterItem > div.radio").append(
      '<button class="jsRepeaterButtonRemove"><i class="fas fa-times"></i></button>'
    );
  }
  if (repeaterItemLength == 44) {
    $(".jsRepeaterButtonAdd").hide();
  }
  $(this)
    .closest(".jsRepeater")
    .find(".jsRepeaterItem")
    .each(function () {
      $(this)
        .find("input")
        .attr("id", "repeaterItem-" + repeaterIndex);
      $(this)
        .find("input")
        .attr("placeholder", "Pilihan " + repeaterIndex);
      $(this)
        .find("input")
        .attr("name", "options[" + repeaterIndex + "]");
      repeaterIndex++;
    });
}

function removeRepeaterItem() {
  $(this).closest(".jsRepeaterItem").remove();
  var repeaterItemLength = $(".jsRepeaterItem").length;
  var repeaterIndex = 1;
  $(".jsRepeaterItem").each(function () {
    $(this)
      .find("input")
      .attr("id", "repeaterItem-" + repeaterIndex);
    $(this)
      .find("input")
      .attr("placeholder", "Pilihan " + repeaterIndex);
    repeaterIndex++;
  });
  if (repeaterItemLength == 2) {
    $(".jsRepeaterItem").find(".jsRepeaterButtonRemove").remove();
  }
  if (repeaterItemLength == 44) {
    $(".jsRepeaterButtonAdd").show();
  }
}

function stickyShare() {
  var scrollValue = $(window).scrollTop();
  var scrollLimit = $(".jsThreadRating");
  var firstPost = $(".postItemFirst");
  var startShow = firstPost.offset().top + firstPost.height();
  if (scrollValue < startShow && scrollValue > scrollLimit.offset().top) {
    $(".jsShareBtn").addClass("scrolled");
  } else {
    $(".jsShareBtn").removeClass("scrolled");
  }
}

function bindJsTippy() {
  tippy(".jsTippy", {
    theme: "translucent",
    arrow: true,
    size: "small",
  });
}

var index;
var timeout = null;

// function resetAnimation() {
//   var el = document.querySelector('.jsHotTopicStoriesItem i');
//   el.style.animation = 'none';
//   el.offsetHeight; /* trigger reflow */
//   el.style.animation = null;
// }

// function playStory(element) {
//   $(".jsHotTopicStoriesItem").removeClass('is-seen is-playing');
//   resetAnimation();

//   var totalStories = $('.jsHotTopicStoriesItem').length;
//   if (element) {
//     index = $(element).attr('data-index');
//   }

//   var media = $(".jsHotTopicStoriesItem[data-index='" + index + "']").attr('data-media');
//   var duration = $(".jsHotTopicStoriesItem[data-index='" + index + "']").attr('data-duration');
//   var date = $(".jsHotTopicStoriesItem[data-index='" + index + "']").attr('data-date');
//   var link = $(".jsHotTopicStoriesItem[data-index='" + index + "']").attr('data-link');
//   var title = $(".jsHotTopicStoriesItem[data-index='" + index + "']").attr('data-title');
//   var description = $(".jsHotTopicStoriesItem[data-index='" + index + "']").attr('data-description');
//   var tracking = $(".jsHotTopicStoriesItem[data-index='" + index + "']").attr('data-tracking');

//   $(".jsHotTopicStoriesItem[data-index='" + index + "']").prevAll().addClass('is-seen');
//   $(".jsHotTopicStoriesItem[data-index='" + index + "']").addClass('is-playing');
//   $(".jsHotTopicStoriesItem[data-index='" + index + "'] i").css('animation-duration', duration+'ms');
//   $('.jsHotTopicStoriesMedia').css('background-image', 'url(' + media + ')');
//   $('.jsHotTopicStoriesDate').html(date);
//   $('.jsHotTopicStoriesTitle').html(title);
//   $('.jsHotTopicStoriesDescription').html(description);
//   $('.jsHotTopicStoriesLink').attr({href:link, onclick:tracking});
//   index++;
//   if (index < totalStories) {
//     timeout = setTimeout(function() {
//       playStory();
//     }, duration);
//   } else {
//     setTimeout(function() {
//       closeStories();
//     }, parseInt(duration) + 100);
//   }
// }

// function closeStories() {
//   index = 0;
//   $(".jsHotTopicStoriesItem").removeClass('is-seen is-playing');
//   $('.jsHotTopicStories').removeClass('is-show');
//   $(document.body).removeClass("Ov(h)");
//   if (timeout != null) {
//     clearTimeout(timeout);
//     timeout= null;
//   }
// }

// function goToStories(direction) {
//   var goTo;
//   if (timeout != null) {

//     clearTimeout(timeout);
//     timeout= null;
//   }

//   if(direction == 'prev'){
//     if(index - 2 < 0){

//         goTo = ".jsHotTopicStoriesItem[data-index='0']";

//     }else{
//       goTo = ".jsHotTopicStoriesItem[data-index='" + (index-2) + "']";
//     }

//     index = 0;
//     $(".jsHotTopicStoriesItem").removeClass('is-seen is-playing');
//     playStory(goTo);
//   }
//   else{

//     goTo = ".jsHotTopicStoriesItem[data-index='" + index + "']";
//     index = 0;
//     $(".jsHotTopicStoriesItem").removeClass('is-seen is-playing');
//     playStory(goTo);
//   }
// }

//embed and media upload
var source;
var filename;
var dataFile;
var rnd;
var dataTypeUploaded;
var sourceCdn = 1;
var sourceImageBucket = 2;
var sourceVideoBucket = 3;

function get_smilies_newthread() {
  localSmilies = get_MRU_revamp();
  if (localSmilies) {
    var mru_smilies = {
      smilies: $.param(localSmilies),
    };
  }
  $.ajax({
    method: "POST",
    url: "/misc/get_smilies_newthread",
    data: mru_smilies || {},
    success: function (result) {
      result = JSON.parse(result);
      smilies = JSON.parse(result.kaskus);
      $(".jsSmiliesEditor").replaceWith(result.content);
      if (result.mru) {
        $("#content-mru").addClass("active");
        load_MRU_revamp();
      } else {
        $("#mru").hide();
      }
      show_tab(".smiley-wrapper .smiley-tab .tab-content > .active");
      if (sceditorInstance) {
        $(".smiley-tab__item")
          .find(".smilie__in-action")
          .not(".smiley-tab__item--unavailable")
          .click(function () {
            insert_smilies_newthread(this.children);
          });
      } else {
        $(".smiley-tab__item")
          .find(".smilie__in-action")
          .not(".smiley-tab__item--unavailable")
          .click(function () {
            var smiley = insert_smilie_reply(this);
            save_smiley_localStorage(smiley);
            var title = $(this.children).attr("title");
            var tabTitle = $(".tabNavItem.is-active .tabNavIcon").attr(
              "data-title"
            );
            eventTracking("smiley", tabTitle, title);
          });
      }
      $("#emoticons").show();
    },
  });
}

function convert_to_video(giphy) {
  var video_file = "/giphy-downsized-small.mp4";
  var regex = /(.+giphy\.com.+)\/.+\.gif$/g;
  var result = regex.exec(giphy);
  return result[1] + video_file;
}

function insert_smilie_reply(elm) {
  var textTarget = $(".jsCreateThreadContent").find("textarea");
  var icon = elm.children;
  var smiley = $(icon).attr("alt") + " ";
  insertCaretPosition(smiley, textTarget);
  return $(icon).attr("alt");
}

function get_giphy_newthread(tabnum, keyword) {
  $.ajax({
    method: "POST",
    url: "/misc/get_giphy/0",
    cache: false,
    data: { keyword: keyword },
  }).done(function (a) {
    (giphy = JSON.parse(a)),
      $("#tab" + tabnum).html(giphy),
      $("#search-giphy").focus();
    if (keyword) {
      $("#search-giphy").val(keyword);
    }
  });
}

function get_MRU_revamp() {
  var temp = [];
  if (localStorage[mru_key]) {
    mru = JSON.parse(localStorage[mru_key]);
    if (mru) {
      for (var a in mru) {
        if (a.search("smilie") > -1) {
          temp.push(mru[a]);
        }
      }
      var data = { smilies: temp };
    }
  }

  return data || {};
}

function load_MRU_revamp() {
  var x = $("#content-mru").find(".loadMRU");
  if (x) {
    $.each(x, function (i, smilie) {
      $(smilie).attr(
        "src",
        $('.loadSmilies[alt="' + $(smilie).attr("data-smilie") + '"]').attr(
          "src"
        )
      );
      $(smilie).attr(
        "title",
        $('.loadSmilies[alt="' + $(smilie).attr("data-smilie") + '"]').attr(
          "title"
        )
      );
      $(smilie).attr(
        "alt",
        $('.loadSmilies[alt="' + $(smilie).attr("data-smilie") + '"]').attr(
          "alt"
        )
      );
    });
  }

  return true;
}

function save_smiley_localStorage(smiley) {
  if (localStorage) {
    var b = JSON.parse(localStorage.getItem(mru_key));
    if (b) for (var c in b) c === "smilie" + smiley && delete b[c];
    else var b = new Object();
    mru_limit == Object.keys(b).length && delete b[Object.keys(b)[0]],
      (b["smilie" + smiley] = smiley),
      localStorage.setItem(mru_key, JSON.stringify(b));
  }
}

function eventTracking(category, action, label) {
  _gaq.push(["_trackEvent", category, action, label]);
  dataLayer.push({
    event: "trackEvent",
    "eventDetails.category": category,
    "eventDetails.action": action,
    "eventDetails.label": label,
  });
}

function intentSignInTrack(tmpCategory, tmpAction) {
  let reg = new RegExp(
    /([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}/i
  );
  let username = $("#username").val();
  if (username.trim().length > 0) {
    let match = reg.exec(username);
    let tmpLabel = match !== null ? "email" : "kaskus";

    eventTracking(tmpCategory, tmpAction, tmpLabel);
  }
}

function get_autocomplete_mention(keyword, isAt, callbackMention) {
  var sctoken = $(".sctoken").val();
  $.ajax({
    url: KASKUS_URL + "/misc/get_user_mention/",
    type: "post",
    data: {
      keyword: keyword,
      securitytoken: sctoken,
      isAt: isAt,
    },
    xhrFields: {
      withCredentials: true,
    },
    success: function (resp) {
      if (typeof resp !== "object") {
        resp = $.parseJSON(resp);
      }

      if (!isAt) {
        if (resp.success) {
          $(".mentionList").html(resp.view);
        } else {
          $(".mentionList").html("");
        }
      } else {
        var result = [];
        var temp;
        for (var item in resp.data) {
          temp = {
            name: resp.data[item].username,
            usertitle: resp.data[item].userTitle,
            avatarpicture: resp.data[item].avatarpicture,
          };
          result.push(temp);
        }
        callbackMention(result);
      }
      $(".sctoken").val(resp.securitytoken);
    },
  });
}

function insert_smilies_newthread(a) {
  if (localStorage) {
    var smilies = JSON.parse(localStorage.getItem(mru_key));
    if (smilies) {
      for (var b in smilies) {
        if (b === "smilie" + $(a).attr("alt")) {
          delete smilies[b];
        }
      }
    } else {
      var smilies = new Object();
    }

    if (mru_limit == Object.keys(smilies).length) {
      delete smilies[Object.keys(smilies)[0]];
    }
    $(a).attr("alt");
    smilies["smilie" + $(a).attr("alt")] = $(a).attr("alt");
    localStorage.setItem(mru_key, JSON.stringify(smilies));
  }
  if (sceditorInstance.inSourceMode()) {
    sceditorInstance.insert($(a).attr("alt"));
  } else {
    sceditorInstance.insert(
      '<img src="' +
      $(a).attr("src") +
      '" data-sceditor-emoticon="' +
      $(a).attr("alt") +
      '" border="0" alt="emoticon-' +
      $(a).attr("title") +
      '" title="' +
      $(a).attr("title") +
      '">',
      null,
      false
    );
  }
  var category = "smiley";
  var label = $(a).attr("title");
  var action = $(".tabNavItem.is-active .tabNavIcon").attr("data-title");

  eventTracking(category, action, label);
}

function checkEmptyGalery() {
  var wrapper = $jQ(".galery-list-wrapper").find("li");
  if (wrapper.length == 0) {
    $jQ(".jsEmbedMediaFormButton").show();
    $jQ(".jsEmbedMediaGallery").hide();

    var wrapper = $jQ(".jsEmbedMediaForm");
    var inputs = wrapper.find("input");
    for (i = 0; i < inputs.length; i++) {
      var inputId = $jQ(inputs[i]).attr("id");
      if (!inputId) {
        $jQ(inputs[i]).attr("id", "browse");
      } else {
        $jQ(inputs[i]).removeAttr("id");
      }
    }
  }
}

function ajaxEmbedMedia(input) {
  $.ajax({
    type: "POST",
    url: KASKUS_URL + "/embed/embed_media/",
    data: {
      url: input,
    },
    success: function (data) {
      var json = $.parseJSON(data);

      if (json.status) {
        if (sceditorInstance) {
          sceditorInstance.insert(json.embed);
        } else {
          var textTarget = $(".jsCreateThreadContent").find("textarea");
          insertCaretPosition(json.embed, textTarget);
        }
        // post_draft(sceditorInstance.val());
        insertThumbnailMedia(json);
      } else {
        swal("Embed Gagal", "Link tidak dapat dikenali", "error");
      }
    },
  });
}

function insertMyEmbedMedia(input) {
  var regexp =
    /^(https?:\/\/)?(www.)?(m\.)?soundcloud\.com\/[\w\-\.]+(\/)+[\w\-\.]+$/;
  url = input.split("?")[0];
  var matches = url.match(regexp);
  if (matches != null) {
    $.ajax({
      type: "GET",
      url: "https://soundcloud.com/oembed?url=" + matches[0] + "&format=json",
      async: false,
      success: function (data) {
        regexpatternTrackId = /(tracks\/|^)(\d+)/;
        var uri = $(data.html).attr("src");
        uri = decodeURIComponent(uri);
        var trackId = uri.match(regexpatternTrackId);
        input = "https://api.soundcloud.com/tracks/" + trackId[2];
        ajaxEmbedMedia(input);
        return;
      },
      error: function (request, status, error) {
        ajaxEmbedMedia(input);
        return;
      },
    });
  } else {
    ajaxEmbedMedia(input);
    return;
  }
}

function insertThumbnailMedia(data) {
  var wrapper = $jQ(".galery-list-wrapper");
  var last_child = wrapper.find("li").last();

  var thumbnail = data.thumbnail;
  var embed = data.embed;
  var value =
    '<li class="W(1/8) P(5px)">\
      <div class="Pos(r) H(0) Pb(100%)">\
          <img class="Mx(a) D(b) Bdrs(3px) oFitCover Pos(a) H(100%) W(100%) insert-embed-thumbnail" src="' +
    thumbnail +
    "\" data-embed='" +
    embed +
    '\'>\
          <button type="button" class="delete-embed-thumbnail Pos(a) T(-5px) End(-5px) Fz(18px) C(c-red) Bgc(c-white) Bdrs(50%) W(18px) H(18px) Lh(18px) C(c-red-bright):h"><i class="fas fa-times-circle"></i></button>\
          <input type="hidden" name="thumbnails[]" value="' +
    thumbnail +
    '"><input type="hidden" name="embeds[]" value=\'' +
    embed +
    "'>\
      </div>\
    </li>";

  if (last_child.length > 0) {
    $jQ(value).insertAfter(last_child);
  } else {
    switchMediaGalery();
    wrapper.append(value);
  }
}

function microtime(get_as_float) {
  var now = new Date().getTime() / 1000;

  var s = parseInt(now, 10);

  return get_as_float ? now : Math.round((now - s) * 1000) / 1000 + " " + s;
}

function switchMediaGalery() {
  var wrapper = $jQ(".galery-list-wrapper");
  var last_child = wrapper.find("li").last();

  if (last_child.length == 0) {
    $jQ(".jsEmbedMediaFormButton").toggle();
    $jQ(".jsEmbedMediaGallery").toggle();

    var wrapper = $jQ(".jsEmbedMediaForm");
    var inputs = wrapper.find("input");
    for (i = 0; i < inputs.length; i++) {
      var inputId = $jQ(inputs[i]).attr("id");
      if (!inputId) {
        $jQ(inputs[i]).attr("id", "browse");
      } else {
        $jQ(inputs[i]).removeAttr("id");
      }
    }
  }
}

function showErrorMessageUpload(message) {
  message = message.replace(/[<]br[^>]*[>]/gi, "");
  swal("Upload Gagal", message, "error");
  window.onbeforeunload = null;
  switchDisableButtonMedia(false);
  showLoading(false);
}

function switchDisableButtonMedia(status) {
  var wrapper = $jQ(".jsEmbedMediaForm");

  var inputs = wrapper.find("input");
  for (i = 0; i < inputs.length; i++) {
    $jQ(inputs[i]).prop("disabled", status);
  }

  var buttons = wrapper.find(".jsMyEmbedMedia");
  for (i = 0; i < buttons.length; i++) {
    $jQ(buttons[i]).prop("disabled", status);
  }
}

function showLoading(status, checkEmpty = true) {
  var wrapper = $jQ(".galery-list-wrapper");

  if (status) {
    var last_child = wrapper.find("li").last();
    var thumbnail = assetsFolderNew + "/images/ic-loading-dots.svg";
    var loading =
      '<li class="W(1/8) P(5px) loading-thumbnail">\
        <div class="Pos(r)">\
            <img class="Mx(a) D(b) Bdrs(3px)" src="' +
      thumbnail +
      '">\
        </div>\
      </li>';

    if (last_child.length > 0) {
      $jQ(loading).insertAfter(last_child);
    } else {
      wrapper.append(loading);
    }
  } else {
    wrapper.find(".loading-thumbnail").remove();
    if (checkEmpty) {
      checkEmptyGalery();
    }
  }
}

function insertThumbnail(thumbnail, embed) {
  showLoading(false, false);

  var wrapper = $jQ(".galery-list-wrapper");
  var last_child = wrapper.find("li").last();
  var value =
    '<li class="W(1/8) P(5px)">\
      <div class="Pos(r) H(0) Pb(100%)">\
          <img class="Mx(a) D(b) Bdrs(3px) oFitCover Pos(a) H(100%) W(100%) insert-embed-thumbnail" src="' +
    thumbnail +
    "\" data-embed='" +
    embed +
    '\'>\
          <button type="button" class="delete-embed-thumbnail Pos(a) T(-5px) End(-5px) Fz(18px) C(c-red) Bgc(c-white) Bdrs(50%) W(18px) H(18px) Lh(18px) C(c-red-bright):h"><i class="fas fa-times-circle"></i></button>\
          <input type="hidden" name="thumbnails[]" value="' +
    thumbnail +
    '"><input type="hidden" name="embeds[]" value=\'' +
    embed +
    "'>\
      </div>\
    </li>";

  if (last_child.length > 0) {
    $jQ(value).insertAfter(last_child);
  } else {
    wrapper.append(value);
  }
  switchDisableButtonMedia(false);
  // sceditorInstance.insert(embed);
  showBottomToast("Berhasil menambah media", 3000);
  // post_draft(sceditorInstance.val());
}

function getExtension(filename) {
  var arr_filename = filename.split(".");
  var extension = arr_filename[arr_filename.length - 1];

  return extension;
}

function isVideoBucketExtension(fileType) {
  var position = allowedVideoMimes.indexOf(fileType);

  if (position > -1) {
    return true;
  }
  return false;
}

function isImageBucketExtension(filename) {
  var extension = getExtension(filename);
  var imageBucketExtension = ["gif"];
  var position = imageBucketExtension.indexOf(extension.toLowerCase());

  if (position > -1) {
    return true;
  }
  return false;
}

function proceedUploadVideo(dataFile) {
  var videoForm = $(".direct-upload#video-upload-form");
  url = videoForm.attr("action");
  source = sourceVideoBucket;
  dataTypeUploaded = dataFile.type;

  filename = (videoFolders.length ? videoFolders.join("/") + "/" : "") + awsKey;
  filename += "_" + microtime(true) + "_." + dataFile.name.split(".").pop();
  videoForm.find('input[name="Content-Type"]').val(dataFile.type);
  videoForm.find('input[name="key"]').val(filename);

  var dataForm = new FormData(videoForm[0]);
  dataForm.set("file", dataFile);

  doUpload(url, dataForm);
}

function proceedUploadImage(dataFile) {
  var form = $(".direct-upload#image-upload-form");
  url = form.attr("action");
  source = sourceImageBucket;
  dataTypeUploaded = dataFile.type;

  filename = (imageFolders.length ? imageFolders.join("/") + "/" : "") + awsKey;
  filename += "_" + microtime(true) + "_." + dataFile.name.split(".").pop();
  form.find('input[name="Content-Type"]').val(dataFile.type);
  form.find('input[name="key"]').val(filename);
  var dataForm = new FormData(form[0]);
  dataForm.set("file", dataFile);

  doUpload(url, dataForm);
}

function uploadVideo(dataFile) {
  var video = document.createElement("video");
  var objectUrl = URL.createObjectURL(dataFile);

  video.src = objectUrl;

  video.onloadedmetadata = function () {
    var duration = video.duration;
    var durationMinutes = VIDEO_MAX_LENGTH / 60;
    var size = dataFile.size;
    var messageValidateVideo = "";

    URL.revokeObjectURL(video.src);

    if (duration > VIDEO_MAX_LENGTH) {
      messageValidateVideo +=
        "Durasi video maksimal " + durationMinutes + " menit. ";
    }

    if (size > VIDEO_MAX_FILESIZE) {
      messageValidateVideo +=
        "Ukuran file maksimal " + VIDEO_MAX_FILESIZE_MB + " MB.";
    }

    if (messageValidateVideo != "") {
      showErrorMessageUpload(messageValidateVideo);
      return;
    }

    proceedUploadVideo(dataFile);
  };
}

function hideElementByClass(element) {
  $(element).removeClass("D(b)");
  $(element).removeClass("D(f)");
  $(element).addClass("D(n)");
}

function showBlockElementByClass(element) {
  $(element).removeClass("D(n)");
  $(element).addClass("D(b)");
}

function showFlexElementByClass(element) {
  $(element).removeClass("D(n)");
  $(element).addClass("D(f)");
}

$(".jsTagList").on("click", ".jsShowTagSuggestion", function () {
  showBlockElementByClass(".jsShowTagSuggestionModal");
  hideElementByClass(".jsTagSuggestion");
  var currentTags = $(".changeTag").val();
  toggleSubmitTagsButton(currentTags);
});

$(".jsTagList").on("click", ".tagItem", function () {
  var category = $(this).parent().data("event-category");
  var action = "open tag thread";
  var label = $(this).text();
  eventTracking(category, action, label);
});

$(".jsTagListModal").on("click", ".tagItem", function () {
  var category = $(this).parent().data("event-category");
  var action = "open tag thread";
  var label = $(this).text();
  eventTracking(category, action, label);
});

$(".jsShowTagSuggestionModalClose").click(function () {
  hideElementByClass(".jsShowTagSuggestionModal");
  showFlexElementByClass(".jsTagSuggestion");
});

$(".changeTag").on("select2:select select2:unselect", function (e) {
  var selectedTags = $(this).val();
  toggleSubmitTagsButton(selectedTags);
});

$(".jsSubmitTag").click(function () {
  var formAction = $("#form_thread_tags").attr("action");
  var formData = $("#form_thread_tags").serialize();
  $.ajax({
    url: formAction,
    dataType: "json",
    type: "post",
    data: formData,
    success: function (response) {
      if (typeof response !== "object") {
        response = $.parseJSON(response);
      }
      if (response.result == true) {
        var tagList = "";
        var tagSearchUrl = "";
        var tagListContent = "";
        var editButton = "";
        if (response.tags.length > 0) {
          $(".jsTagList").attr(
            "class",
            "D(f) Ai(fs) Mstart(8px) Fx(flex1Auto) Fxw(w) Fz(14px) jsTagList"
          );
          $(".jsShowTagSuggestion").attr({
            class:
              "jsShowTagSuggestion jsTippy Fz(14px) Mx(4px) Mb(8px) D(b) Bgc(c-white) C(c-blue) Px(8px) Py(4px) Bd(borderSolidGray2) Fw(500) Bdrs(3px)",
            "data-current-tags": JSON.stringify(response.tags),
          });
          $.each(response.tags, function (i, tag) {
            tagSearchUrl = response.search_path + tag;
            tagList +=
              '<a href="' +
              tagSearchUrl +
              '" class="Mx(4px) Mb(8px) D(b) Bgc(c-white) C(c-blue) Px(8px) Py(4px) Bd(borderSolidGray2) Fw(500) Bdrs(3px) tagItem"> ' +
              tag +
              " </a>";
          });
          editButton = $("button.jsShowTagSuggestion")
            .clone()
            .wrap("<div/>")
            .parent()
            .html();
          tagListContent = tagList + editButton;
        } else {
          $(".jsTagList").attr(
            "class",
            "Mstart(12px) D(f) Fx(flexOne) C(c-secondary) jsTagList"
          );
          $(".jsShowTagSuggestion").attr({
            class:
              "jsShowTagSuggestion Fx(flexZero) Mx(4px) D(b) Bgc(c-white) C(c-blue) Px(8px) Py(4px) Bd(borderSolidGray2) Fw(500) Bdrs(3px)",
            "data-current-tags": JSON.stringify(response.tags),
          });
          var noTagList =
            '<div class="Bgc(c-blue-1-transparent) Fx(flexOne) Bdrs(5px) Py(4px) Ta(c) Fz(14px) noTagList">' +
            response.no_tags_caption +
            "</div>";
          editButton = $("button.jsShowTagSuggestion")
            .clone()
            .wrap("<div/>")
            .parent()
            .html();
          tagListContent = noTagList + editButton;
        }

        $(".jsTagList").html(tagListContent);
      }
      $(".sctoken").val(response.securitytoken);
      showBottomToast(response.message, 2000);
      $(".jsShowTagSuggestionModalClose").click();
    },
  });
});

var changeTagList = $(".changeTag");
if (changeTagList.length > 0) {
  changeTagList.select2({
    minimumResultsForSearch: Infinity,
    dropdownCssClass: "sfthFormDropdown",
  });
}

var searchTagList = $(".searchByTag");
if (searchTagList.length > 0) {
  searchTagList.select2({
    minimumResultsForSearch: Infinity,
    dropdownCssClass: "sfthFormDropdown",
    placeholder: window.KASKUS_lang.tag_placeholder,
    sorter: (data) => data.sort((a, b) => a.selected < b.selected),
  });
}

function toggleSubmitTagsButton(selectedTags) {
  selectedTags = JSON.stringify(selectedTags);
  var currentTags = JSON.stringify(
    $("button.jsShowTagSuggestion").data("current-tags")
  );
  if (currentTags == selectedTags || selectedTags == "[]") {
    $("button.jsSubmitTag").attr({
      class:
        "jsSubmitTag Fz(14px) Fw(500) C(c-grey) Bgc(c-grey-light) Bd(0) Px(40px) Py(8px) H(36px) Bdrs(3px)",
      disabled: true,
    });
  } else {
    $("button.jsSubmitTag").attr({
      class:
        "jsSubmitTag Fz(14px) Fw(500) C(c-white) Bgc(c-blue-1) Bd(0) Px(40px) Py(8px) H(36px) Bdrs(3px)",
      disabled: false,
    });
  }
}

function openCamera(e) {
  var container = $(e).next(".jsCameraBox");
  showBlockElementByClass(container);
}

function uploadImage(dataFile) {
  var image = new Image();
  var objectUrl = URL.createObjectURL(dataFile);

  image.src = objectUrl;

  image.onload = function () {
    var imageWidth = image.width;
    var imageHeight = image.height;
    var messageValidateImage = "";
    var size = dataFile.size;
    var minHWRatio = 1 / 5; // minimum height (1 / 5 width)
    var maxHWRatio = 99999; // ~unlimited height

    URL.revokeObjectURL(image.src);

    if (size > IMAGE_MAX_FILESIZE) {
      messageValidateImage +=
        "Ukuran GIF maksimal " + IMAGE_MAX_FILESIZE_MB + ". ";
    }

    if (
      imageHeight / imageWidth > maxHWRatio ||
      imageHeight / imageWidth < minHWRatio
    ) {
      messageValidateImage += "Rasio GIF tidak disupport.";
    }

    if (messageValidateImage != "") {
      showErrorMessageUpload(messageValidateImage);
      return;
    }

    proceedUploadImage(dataFile);
  };
}

function isCdnExtension(filename) {
  var extension = getExtension(filename);
  var cdnExtension = ["jpg", "jpeg", "png"];
  var position = cdnExtension.indexOf(extension.toLowerCase());

  if (position > -1) {
    return true;
  }
  return false;
}

function checkUploadStatus(filename) {
  setTimeout(function () {
    getUploadStatus(filename);
  }, 1000);
}

function getUploadStatus(filename) {
  var urlUploadStatus;
  var fileToCheck;
  var seg = filename.split(".");

  if (source == sourceImageBucket) {
    urlUploadStatus = "/misc/get_imageupload_status/";
    fileToCheck = seg.splice(0, seg.length - 1).join(".");
  } else if (source == sourceVideoBucket) {
    urlUploadStatus = "/misc/get_videoupload_status/";
    fileToCheck = filename;
  }

  $.ajax({
    url: urlUploadStatus + hex_md5(str_to_ent(fileToCheck)),
    success: function (data) {
      var json = $.parseJSON(data);
      if (json.processing) {
        setTimeout(function () {
          getUploadStatus(filename);
        }, 3000);
      } else if (json.success) {
        var message = $.parseJSON(json.message);
        var url;
        var urlImg;
        var tag;
        var urlFirstEmbed;

        if (source == sourceImageBucket) {
          url = awsCdn + "/" + message.filename;
          urlFirstEmbed = url;
          urlImg = url + ".png";
          tag = ["[video]", "[/video]"];
        } else if (source == sourceVideoBucket) {
          url = json.video_url;
          url = url.split("/").pop();
          urlImg = awsCdn + "/" + message.thumbnail;
          tag = ["[kaskus_video]", "[/kaskus_video]"];
          $jQ("#newthread-upload-wrapper").after(
            '<input type="hidden" name="additionalData[' +
            url +
            ']" value="' +
            urlImg +
            '">'
          );
        }

        var embed = tag[0] + url + tag[1];
        insertThumbnail(urlImg, embed);
        window.onbeforeunload = null;
      } else if (json.message) {
        showErrorMessageUpload(json.message);
        $("#" + rnd).remove();
        $("#newthread-upload-button").show();
      }
    },
  });
}

function handleResult(data) {
  rnd = $("#browse").attr("data-rnd");
  if (data.hasOwnProperty("securitytoken")) {
    $(".sctoken").val(data.securitytoken);
  }

  if (data.status == "ok" || data.statusText == "Created") {
    if (source == sourceCdn) {
      var embed = "[img]" + data.url + "[/img]";
      insertThumbnail(data.url, embed);
      window.onbeforeunload = null;
    } else if (source == sourceImageBucket) {
      checkUploadStatus(filename);
    } else if (source == sourceVideoBucket) {
      checkUploadStatus(filename);
    }

    $("#browse").attr("data-rnd", "rnd_" + +new Date());
  } else {
    showErrorMessageUpload(data.error);
  }
}

function doUpload(url, dataForm) {
  $.ajax({
    url: url,
    method: "POST",
    data: dataForm,
    dataType: "json",
    contentType: false,
    cache: false,
    processData: false,
    statusCode: {
      200: handleResult,
      201: handleResult,
    },
    error: function (jqXHR, textStatus) {
      if (jqXHR.status != 201) {
        showErrorMessageUpload("Terjadi kesalahan memproses data.");
      }
    },
  });
}

function insertCaretPosition(value, target) {
  var jArea = jQuery(target);
  var textAreaTxt = jArea.val();
  var startPos = jArea[0].selectionStart;
  var endPos = jArea[0].selectionEnd;
  $(target).val(
    textAreaTxt.substring(0, startPos) +
    value +
    textAreaTxt.substring(endPos, textAreaTxt.length)
  );
  jArea.focus();
  jArea[0].selectionStart = startPos + value.length;
  jArea[0].selectionEnd = startPos + value.length;
}

document.is_sending = false;
document.last_sent = "";
var preview_url = KASKUS_URL + "/misc/preview_post_ajax";

function send_once() {
  clearTimeout(document.tid);

  document.tid = setTimeout(function () {
    preview();
  }, 3000);
}

function preview() {
  if (jQuery.type($("#reply-messsage").val()) === "undefined") return;

  $("#preview-title").text($("#form-title").val());

  var parseurl = $("input[name=parseurl]").is(":checked") ? 1 : 0;

  var last_sent =
    parseurl + $("#reply-messsage").val() + $("#form-title").val();

  if (document.is_sending || document.last_sent == last_sent) {
    return false;
  }

  document.last_sent = last_sent;

  if (
    $("#reply-messsage").val().length == 0 &&
    $("#form-title").val().length == 0
  ) {
    $("#preview-code").html("");
    return false;
  }

  if (typeof window.IS_QUICKNEWTHREAD == "undefined") {
    window.IS_QUICKNEWTHREAD = 0;
  }

  $("#draft_last_updated").html("Menyimpan...");
  document.is_sending = true;

  $.ajax({
    url: preview_url,
    type: "post",
    data: {
      message: $("#reply-messsage").val(),
      parseurl: parseurl,
      forum_id: $("#forum_id").val(),
      icon_id: parseInt($("input[name=iconid]:checked").val()),
      title: $("#form-title").val(),
      draft_id: $("#draft_id").val(),
      is_quicknewthread: window.IS_QUICKNEWTHREAD,
    },
    xhrFields: {
      withCredentials: true,
    },
    success: function (reply) {
      document.is_sending = false;

      var resp = $.parseJSON(reply);

      if (resp.message) {
        $("#preview-code").html(resp.message);
        notice(
          "Post preview updated &nbsp;&nbsp;&nbsp;<a href=\"javascript:scroll_to('preview-code')\">Click to view</a>",
          4000
        );
        $(".mls-img").kslzy(300);
      }

      if (resp.draft_last_updated) {
        $("#draft_id").val(resp.draft_id);
        $("#draft_last_updated").removeClass();
        $("#draft_last_updated").addClass("editor-draft editor-draft--success");
        $("#draft_last_updated")
          .html("Terakhir disimpan: " + resp.draft_last_updated)
          .css("color", "#1998ed")
          .animate({ color: "#676767" }, 2000);
      }

      if (resp.draft_error) {
        $("#draft_last_updated").removeClass();
        $("#draft_last_updated").css("color", "");
        $("#draft_last_updated").addClass("editor-draft editor-draft--error");
        $("#draft_last_updated").html(resp.draft_error);
      }

      preview();
    },
    error: function (xhr) {
      document.is_sending = false;
      preview();
    },
  });
}

function change_preview_mode(obj) {
  var parseurl = $("input[name=parseurl]").is(":checked") ? 1 : 0;
  var last_sent =
    parseurl + $("#reply-messsage").val() + $("#form-title").val();

  if (
    document.is_sending ||
    document.last_sent == last_sent ||
    ($("#reply-messsage").val().length == 0 &&
      $("#form-title").val().length == 0)
  ) {
    $(".jsEditorContainer").hide();
    $(".jsPreviewContainer").show();
    obj.find("span").text("Edit");
  } else {
    preview();
    obj.attr("disabled", true);
    obj.addClass("Bd(borderSolidGray2 C(c-gray-2)");
    obj.removeClass("Bd(borderSolidBlue) C(c-blue) Bgc(c-white-blue-hover):h");
    $(document).ajaxComplete(function (event, request, settings) {
      if (settings.url == preview_url) {
        $(".jsEditorContainer").hide();
        $(".jsPreviewContainer").show();
        obj.removeAttr("disabled");
        obj.removeClass("Bd(borderSolidGray2 C(c-gray-2)");
        obj.addClass("Bd(borderSolidBlue) C(c-blue) Bgc(c-white-blue-hover):h");
        obj.find("span").text("Edit");
      }
    });
  }

  if (
    $("#reply-messsage").val().length > 0 ||
    $("#form-title").val().length > 0
  ) {
    if ($("#form-title").val().length == 0) {
      $("#preview-title").hide();
    } else {
      $("#preview-title").show();
    }

    $("#empty-text-preview").hide();
    $("#exist-text-preview").show();
  } else {
    $("#empty-text-preview").show();
    $("#exist-text-preview").hide();
  }
}

function change_edit_mode(obj) {
  $(".jsEditorContainer").show();
  $(".jsPreviewContainer").hide();
  obj.find("span").text("Preview");
}

function bindOnboardingStep2() {
  $(document).on('click', '#back-button-onboarding', function () {
    $('#onboarding-step-1').removeClass('D(n)');
    $('#onboarding-step-2').addClass('D(n)');
    $('.modal-indicator').first().addClass('Bgc(c-gray-7)').removeClass('Bgc(c-gray-4)');
    $('.modal-indicator').last().addClass('Bgc(c-gray-4)').removeClass('Bgc(c-gray-7)');
  });

  $(document).on('click', '.jsJoinButton', function () {
    button = $(this).find('button');
    button.toggleClass('C(c-white) Bgc(c-blue) C(c-blue-1) Bgc(c-white) Bd(borderSolidBlue1)');
    button.text(button.text().trim() === window.KASKUS_lang.btn_forum_select ? window.KASKUS_lang.btn_forum_selected : window.KASKUS_lang.btn_forum_select);
    checkBoxes = $(this).find('input[type=checkbox]');
    checkBoxes.prop("checked", !checkBoxes.prop("checked"));
    if ($('.jsJoinButton button.Bgc\\(c-white\\)').length > 2) {
      $('#final-button-onboarding').addClass('C(c-white) Bgc(c-blue)').removeClass('C(c-grey) Bgc(c-gray-2) Cur(d)').removeAttr('disabled');
    } else {
      $('#final-button-onboarding').addClass('C(c-grey) Bgc(c-gray-2) Cur(d)').removeClass('C(c-white) Bgc(c-blue)').attr('disabled');
    }
  });

  $(document).on('click', '#final-button-onboarding', function () {
    if ($('.jsJoinButton button.Bgc\\(c-white\\)').length > 2) {
      var formAction = $("#select_forum").attr("action");
      var formData = $("#select_forum").serialize();
      $.ajax({
        url: formAction,
        dataType: "json",
        type: "post",
        data: formData,
        success: function (response) {
          if (typeof response !== "object") {
            response = $.parseJSON(response);
          }
        },
      });

      let dataForumIds = formData.split("&");
      for(let key in dataForumIds)
      {
          let forumId = dataForumIds[key].split("=")[1];
          dataLayer.push({
            event: "trackEvent",
            "eventDetails.category": "community interaction",
            "eventDetails.action": "join community",
            "eventDetails.label": "onboarding community",
            "forumID": $('#obForum' + forumId).data('forum-id'),
            "forumName": $('#obForum' + forumId).data('forum-name'),
            "forumParentID": $('#obForum' + forumId).data('forum-parent-id'),
            "forumParentName": $('#obForum' + forumId).data('forum-parent-name'),
            "channelID": $('#obForum' + forumId).data('channel-id'),
            "channelName": $('#obForum' + forumId).data('channel-name'),
            "forumSubscriber": "1"
          });
      }

      showBottomToast(window.KASKUS_lang.ob_toast_subscribed, 2000);
      setTimeout(() => {
        location.reload();
      }, 3000);
    }
  });

}

$(document).ready(function () {
  tippy(".jsTippyBold", {
    arrow: true,
    size: "small",
  });

  var prices = document.querySelectorAll(".plus-price");
  for (var i = 0; i < prices.length; i++) {
    if (prices[i].checked)
      document.querySelector(".jsPlusPriceTotal").textContent =
        document.getElementById("packet" + prices[i].value).textContent;
    prices[i].addEventListener("change", function () {
      if (this.checked)
        document.querySelector(".jsPlusPriceTotal").textContent =
          document.getElementById("packet" + this.value).textContent;
    });
  }

  $(".jsOpenCamera").click(function () {
    openCamera($(this));
    hideElementByClass($(this));
  });

  $(".jsCloseCamera").click(function () {
    hideElementByClass($(this).parent());
    showBlockElementByClass(
      $(this).closest(".jsCameraContainer").find(".jsOpenCamera")
    );
  });

  $(".jsRemoveFromBlacklist").click(function (event) {
    event.preventDefault();
    let username = $(this)
      .parents(".jsBlacklistCard")
      .find(".jsBlacklistUserName")[0].innerHTML;
    let targetUserId = $(this).data("userid");

    swal({
      text: "Menghapus " + username + " dari daftar blocklist. Yakin?",
      icon: "error",
      buttons: ["Batal", "Hapus"],
      dangerMode: true,
    }).then((removeBlacklist) => {
      if (removeBlacklist) {
        $("#target_userid").val(targetUserId);
        $("#unblacklistForm").submit();
      }
    });
  });

  var communityRules = document.querySelectorAll(".communityRules > details");

  communityRules.forEach((element) => {
    element.addEventListener("toggle", (event) => {
      var chevron = event.target.querySelector(".chevronIcon");
      if (event.target.open) {
        chevron.classList.add("fa-chevron-up");
        chevron.classList.remove("fa-chevron-down");
      } else {
        chevron.classList.add("fa-chevron-down");
        chevron.classList.remove("fa-chevron-up");
      }
    });
  });

  if ($("body").find(".jsSmiliesEditor").length > 0) {
    get_smilies_newthread();
  }

  var autocomplete_mention_timer;
  var enterKeyCode = 13;
  var giphy_timer;
  var giphy_tab_id;

  $(".mainContent, .qr-section, .small-reply").on(
    "keyup",
    ".autocomplete-mention",
    function (event) {
      var keyword = $(".autocomplete-mention").val();
      keyword = keyword.trim();
      if (keyword.length > 0) {
        if (event.keyCode === enterKeyCode) {
          clearTimeout(autocomplete_mention_timer);
          get_autocomplete_mention(keyword, false);
        } else {
          clearTimeout(autocomplete_mention_timer);
          autocomplete_mention_timer = setTimeout(function () {
            get_autocomplete_mention(keyword, false);
            return false;
          }, 1000);
        }
      } else {
        $(".autocomplete-mention").val("");
        $(".mentionList").html("");
      }
    }
  );

  $(".mainContent, .qr-section, .small-reply").on(
    "keydown",
    ".autocomplete-mention",
    function (event) {
      if (event.keyCode === enterKeyCode) {
        event.preventDefault();
        return false;
      }
    }
  );

  $(".jsEditorContainer").on("click", ".jsNgetopTabButton", function () {
    var categoryname = $(this).data("category");
    if (categoryname == "Giphy") {
      giphy_tab_id = $(this).data("tabnum");
      get_giphy_newthread(giphy_tab_id);
    }
    var indexElement = $(".jsNgetopTabButton").index(this);
    $(".jsNgetopTabButton").removeClass("is-active");
    $(this).addClass("is-active");
    $(".jsNgetopTabLine").css(
      "transform",
      "translateX(" + $(this).position().left + "px)"
    );
    $(".jsNgetopTabContent").css(
      "transform",
      "translateX(-" + indexElement * 100 + "%)"
    );
    $(".jsNgetopTabContent").css(
      "height",
      $(
        ".jsNgetopTabContent > div:nth-child(" + (indexElement + 1) + ")"
      ).height()
    );
  });

  $(".jsEditorContainer").on("keydown", "#search-giphy", function (event) {
    if (event.keyCode === 13) {
      clearTimeout(giphy_timer);
      event.preventDefault();
      query = event.target.value;
      get_giphy_newthread(giphy_tab_id, query);
    } else {
      clearTimeout(giphy_timer);
      giphy_timer = setTimeout(function () {
        giphy_keyword = event.target.value;
        get_giphy_newthread(giphy_tab_id, giphy_keyword);
        return false;
      }, 1000);
    }
  });

  $(".jsEditorContainer").on("click", ".giphy-smilie li a", function () {
    var textTarget = $(".jsCreateThreadContent").find("textarea");
    var giphy_icon = this.children;
    var emoticon = $(giphy_icon).attr("data-src") + " ";
    var converted_link = convert_to_video($(giphy_icon).attr("src"));
    insertCaretPosition(emoticon, textTarget);
  });

  $(".mainContent").on("click", ".user-mention", function (e) {
    var username = $(this).find(".username-mention").text();
    var mention = "[mention]" + username + "[/mention]";
    if (sceditorInstance) {
      sceditorInstance.insert(mention);
    } else {
      var textTarget = $(".jsCreateThreadContent").find("textarea");
      insertCaretPosition(mention, textTarget);
    }

    $(".mentionList").html("");
    $(".autocomplete-mention").val("");
    $(".jsMentionContainer").removeClass("is-visible");
    $(".jsButtonMention").removeClass("active");
    e.stopPropagation();
  });

  $(".jsStarRating").on("click", function () {
    var starIndex = $jQ(this).attr("data-star-index");
    $("#ratingReply").val(starIndex);
  });

  $(".form-submit-reply").submit(function (event, trigger) {
    if ($("#add_to_warehouse:checked").length > 0 && !trigger) {
      event.preventDefault();
      $.ajax({
        url: KASKUS_URL + "/misc/check_creator_length",
        data: { message: sceditorInstance.val() },
        type: "POST",
        success: function (response) {
          if (typeof response !== "object") {
            response = $.parseJSON(response);
          }

          if (response.success) {
            $(".form-submit-reply").trigger("submit", {});
          } else {
            swal({
              text: response.text,
              icon: "warning",
              buttons: {
                cancel: "Batal",
                confirm: "Post",
              },
              dangerMode: true,
            }).then(function (option) {
              if (option) {
                $(".form-submit-reply").trigger("submit", {});
              }
            });
          }
        },
      });
    } else {
      return;
    }
  });

  $("#button-save-draft").click(function () {
    post_draft(sceditorInstance.val());
  });

  $("#draft_sidebar").on("click", ".qnt-draft-add", function () {
    var draft_id = $(this).data("draft-id");
    $.ajax({
      url: KASKUS_URL + "/quicknewthread/get_one_draft/" + draft_id,
      type: "GET",
      success: function (response) {
        if (typeof response !== "object") {
          response = $.parseJSON(response);
        }
        if (response.result) {
          var draft = response.draft;
          sceditorInstance.val(draft.content);
          $(sceditorInstance.getBody()).removeClass("placeholder");
          $("#form-title").focus();
          $("#form-title").val(draft.title);
          $("#draft_id").val(draft_id);
          var replaceForumId = 0;
          if (draft.forum_id != false) {
            replaceForumId = draft.forum_id;
          }
          $("#forum_id").val(replaceForumId);
          $("#forum_id").trigger("change", [draft.tags]);
          $("#draft_sidebar ul.draft-content").html(
            $(response.view).find("ul.draft-content").html()
          );
          update_draft_count();
          countChars();
        } else {
          swal("Draft tidak ditemukan").then(function () {
            if (response.view != "") {
              $("#draft_sidebar ul.draft-content").html(
                $(response.view).find("ul.draft-content").html()
              );
              update_draft_count();
            }
          });
        }
      },
    });
  });

  $("#draft_sidebar").on("click", ".qnt-draft-delete", function () {
    var currrentBtn = this;
    swal({
      text: "Draft akan dihapus. Yakin?",
      icon: "warning",
      buttons: {
        cancel: "Batal",
        confirm: "Hapus",
      },
      dangerMode: true,
    }).then(function (result) {
      if (result) {
        var draft_id = $(currrentBtn).data("draft-id");
        $.ajax({
          url: KASKUS_URL + "/quicknewthread/delete_one_draft/" + draft_id,
          type: "GET",
          success: function (response) {
            if (typeof response !== "object") {
              response = $.parseJSON(response);
            }
            if (response.result) {
              if ($("#draft_id").val() == draft_id) {
                $("#draft_id").val("");
              }
              $("#draft_sidebar ul.draft-content").html(
                $(response.view).find("ul.draft-content").html()
              );
              update_draft_count();
            } else {
              swal("Draft tidak ditemukan").then(function () {
                if (response.view != "") {
                  $("#draft_sidebar ul.draft-content").html(
                    $(response.view).find("ul.draft-content").html()
                  );
                  update_draft_count();
                }
              });
            }
          },
        });
      }
    });
  });

  function post_draft(message) {
    var last_sent = message + $("#form-title").val();
    var selected_tags = $(".createThreadTag").find(":selected");
    var last_selected_tag_count = selected_tags.length;
    selected_tags = selected_tags
      .map(function () {
        return $(this).val();
      })
      .toArray();
    if (
      document.is_sending ||
      (document.last_sent == last_sent &&
        document.last_selected_tag_count == last_selected_tag_count)
    ) {
      return;
    }

    document.is_sending = true;
    document.last_sent = last_sent;
    document.last_selected_tag_count = last_selected_tag_count;
    $(".draft-info").html("Menyimpan...");
    $.ajax({
      url: KASKUS_URL + "/misc/post_draft/",
      type: "post",
      data: {
        message: message,
        parseurl: 1,
        forum_id: $("#forum_id").val(),
        title: $("#form-title").val(),
        content: $("#reply-messsage").val(),
        draft_id: $("#draft_id").val(),
        thread_tags: selected_tags,
      },
      xhrFields: {
        withCredentials: true,
      },
      success: function (resp) {
        document.is_sending = false;
        if (typeof resp !== "object") {
          resp = $.parseJSON(resp);
        }
        $(".draft-info").html("");
        if (resp.draft_error) {
          $(".draft-info").html(resp.draft_error);
        }
        if (resp.draft_last_updated) {
          $("#draft_id").val(resp.draft_id);
          $(".draft-info")
            .html("Terakhir disimpan: " + resp.draft_last_updated)
            .css("color", "#1998ed")
            .animate({ color: "#676767" }, 2000);
          $("#draft_sidebar ul.draft-content").html(
            $(resp.view).find("ul.draft-content").html()
          );
        }
        update_draft_count();
      },
      error: function (xhr) {
        document.is_sending = false;
      },
    });
  }

  function update_draft_count() {
    var listDraft = $("#draft_sidebar ul.draft-content li").not(
      ".draftItemPlaceholder"
    );
    $("#draft-head").html("Draft (" + listDraft.length + ")");
    if (listDraft.length > 0) {
      $(".draftItemPlaceholder").addClass("D(n)");
    } else {
      $(".draftItemPlaceholder").removeClass("D(n)");
    }
  }

  $(".jsToolbarSCEditorAnchor").on("click", ".jsNgetopTabButton", function () {
    var categoryname = $(this).data("category");
    if (categoryname == "Giphy") {
      giphy_tab_id = $(this).data("tabnum");
      get_giphy_newthread(giphy_tab_id);
    }
    var indexElement = $(".jsNgetopTabButton").index(this);
    $(".jsNgetopTabButton").removeClass("is-active");
    $(this).addClass("is-active");
    $(".jsNgetopTabLine").css(
      "transform",
      "translateX(" + $(this).position().left + "px)"
    );
    $(".jsNgetopTabContent").css(
      "transform",
      "translateX(-" + indexElement * 100 + "%)"
    );
    $(".jsNgetopTabContent").css(
      "height",
      $(
        ".jsNgetopTabContent > div:nth-child(" + (indexElement + 1) + ")"
      ).height()
    );
  });

  $(".jsToolbarSCEditorAnchor").on(
    "keydown",
    "#search-giphy",
    function (event) {
      if (event.keyCode === 13) {
        clearTimeout(giphy_timer);
        event.preventDefault();
        query = event.target.value;
        get_giphy_newthread(giphy_tab_id, query);
      } else {
        clearTimeout(giphy_timer);
        giphy_timer = setTimeout(function () {
          giphy_keyword = event.target.value;
          get_giphy_newthread(giphy_tab_id, giphy_keyword);
          return false;
        }, 1000);
      }
    }
  );

  $(".jsToolbarSCEditorAnchor").on("click", ".giphy-smilie li a", function () {
    a = this.children;
    emoticon = $(a).attr("data-src") + " ";
    converted_link = convert_to_video($(a).attr("src"));
    if (sceditorInstance.inSourceMode()) {
      sceditorInstance.insert($(a).attr("data-src"));
    } else {
      sceditorInstance.insert(
        '<video class="c-giphy__preview" autoplay loop data-src="' +
        converted_link +
        '"> <source src="' +
        converted_link +
        '" type="video/mp4"> </video>&nbsp',
        null,
        !1
      );
    }
  });

  $(".createThreadTag").on("change", function () {
    clearTimeout(document.postdraft_tid);
    document.postdraft_tid = setTimeout(function () {
      post_draft(sceditorInstance.val());
    }, 3000);
  });

  $(".jsToolbarSCEditorAnchor").on("click", ".tabNavIcon", function () {
    var category = "smiley";
    var label = "click";
    var action = $(this).attr("data-title");
    eventTracking(category, action, label);
  });

  if (sceditorInstance) {
    sceditorInstance.keyPress(function () {
      clearTimeout(document.postdraft_tid);
      document.postdraft_tid = setTimeout(function () {
        post_draft(sceditorInstance.val());
      }, 3000);
    });

    $("#form-title").bind("keyup", function () {
      clearTimeout(document.tid);
      document.tid = setTimeout(function () {
        post_draft(sceditorInstance.val());
      }, 1000);
    });

    var ifr = $(".jsCreateThreadContent iframe")[0];
    $(sceditorInstance.getBody())
      .atwho("setIframe", ifr)
      .atwho({
        at: "@",
        limit: 8,
        displayTpl:
          "<li class='D(f)'><img class='Bdrs(50%) Mend(10px)' src='${avatarpicture}' height='35' width='35'/> <div class='Fx(flexOne)'><div>${name}</div><div class='Fz(11px) small'>${usertitle}</div></div> </li>",
        insertTpl:
          "<a href='/${atwho-at}${name}' target='_blank' class='mention'>${atwho-at}${name}</a>",
        callbacks: {
          remoteFilter: function (keyword, callbackMention) {
            clearTimeout(autocomplete_mention_timer);
            autocomplete_mention_timer = setTimeout(function () {
              get_autocomplete_mention(keyword, true, callbackMention);
            }, 1000);
          },
        },
      });

    var hidden, visibilityState, visibilityChange;
    if (typeof document.hidden !== "undefined") {
      (hidden = "hidden"),
        (visibilityChange = "visibilitychange"),
        (visibilityState = "visibilityState");
    } else if (typeof document.mozHidden !== "undefined") {
      (hidden = "mozHidden"),
        (visibilityChange = "mozvisibilitychange"),
        (visibilityState = "mozVisibilityState");
    } else if (typeof document.msHidden !== "undefined") {
      (hidden = "msHidden"),
        (visibilityChange = "msvisibilitychange"),
        (visibilityState = "msVisibilityState");
    } else if (typeof document.webkitHidden !== "undefined") {
      (hidden = "webkitHidden"),
        (visibilityChange = "webkitvisibilitychange"),
        (visibilityState = "webkitVisibilityState");
    }

    document.addEventListener(visibilityChange, function () {
      setTimeout(function () {
        sceditorInstance.expandToContent();
      }, 500);
    });
  }

  //For upload media
  //-- start
  $("body").on("change", "#browse", function () {
    var file = $("#browse");
    var dataForm;
    var url;
    var afu_uploading = {};
    rnd = $("#browse").attr("data-rnd");

    dataFile = file[0].files[0];

    if (dataFile == undefined) {
      return;
    }
    window.onbeforeunload = function () {
      return "You have unsaved changes.";
    };

    switchMediaGalery();
    switchDisableButtonMedia(true);
    showLoading(true);

    if (isCdnExtension(file.val())) {
      url = "/misc/upload_image/";
      source = sourceCdn;
      dataForm = new FormData();
      dataForm.append(file[0].name, dataFile);
      dataForm.append("securitytoken", $(".sctoken").val());

      if (afu_uploading[rnd]) return;
      afu_uploading[rnd] = true;
      doUpload(url, dataForm);
    } else if (isImageBucketExtension(file.val())) {
      uploadImage(dataFile);
    } else if (isVideoBucketExtension(dataFile.type)) {
      uploadVideo(dataFile);
    } else {
      showErrorMessageUpload("Ekstensi tidak didukung.");
      return;
    }
  });
  //-- end

  //For embed media
  //-- start
  $("body").on("click", ".jsMyEmbedMedia", function () {
    var supportedMedia =
      '<div class="Ta(c) Mb(10px)">\
                <div>\
                  <i title="Youtube" class="fab fa-youtube"></i>\
                  <i title="Vimeo" class="fab fa-vimeo-square"></i>\
                  <i title="Soundcloud" class="fab fa-soundcloud"></i>\
                  <i title="Twitch" class="fab fa-twitch"></i>\
                  <i title="Facebook Video" class="icon icon-facebook-video"></i>\
                  <i title="Dailymotion" class="icon icon-daily-motion"></i>\
                  <i title="Smule" class="icon icon-smule"></i>\
                  <i title="Twitter" class="fab fa-twitter"></i>\
                  <i title="Instagram" class="fab fa-instagram"></i>\
                </div>\
              </div>';
    swal({
      text: "Embed media",
      content: {
        element: "input",
        attributes: {
          placeholder: "Masukan link media di sini",
        },
      },
    }).then(function (input) {
      if (input) {
        input = input.trim();
        insertMyEmbedMedia(input);
      }
    });
    $(".swal-content .swal-content__input").before(supportedMedia);
  });

  $("body").on("click", ".insert-embed-thumbnail", function (event) {
    var target = event.target;
    var embed = target.dataset.embed;
    if (sceditorInstance) {
      sceditorInstance.insert(embed);
    } else {
      var textTarget = $(".jsCreateThreadContent").find("textarea");
      insertCaretPosition(embed, textTarget);
    }
    // post_draft(sceditorInstance.val());
  });

  $("body").on("click", ".delete-embed-thumbnail", function (event) {
    swal("Media akan dihapus. Yakin?", {
      buttons: {
        cancel: "Batal",
        confirm: {
          text: "Hapus",
          value: true,
        },
      },
      dangerMode: true,
    }).then(function (input) {
      if (input) {
        $jQ(event.currentTarget).parents("li").remove();
        checkEmptyGalery();
      }
    });
  });
  //-- end

  if (document.getElementById("preview-title") != null) {
    $(".jsPreviewPost").click(function () {
      var previewObj = $(this);
      if ($(".jsEditorContainer").is(":visible")) {
        change_preview_mode(previewObj);
      } else {
        change_edit_mode(previewObj);
      }
    });

    var form_title = $("#form-title").val();
    if (form_title.length > 0) {
      $("#preview-title").text(form_title);
    }

    $("input[name=parseurl]").change(function () {
      send_once();
    });

    preview();
  }

  $(document).on("click", ".jsSearchStickyBtn", function () {
    $(".jsSearchTrigger, .jsSearchSticky").one(
      "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
      function () {
        if ($(".jsSearchTrigger, .jsSearchSticky").hasClass("is-clicked")) {
          $(".jsSearchFormInput").focus();
        }
      }
    );
    $(".jsSearchTrigger, .jsSearchSticky").addClass("is-clicked");
    $(".jsSearchResult").addClass("is-open");
    $(".jsNavHeaderOverlay").show();
    $(".jsSearchOutterWrapper").show();
  });

  var createThreadTagList = $(".createThreadTag");
  if (createThreadTagList.length > 0) {
    createThreadTagList.select2({
      minimumResultsForSearch: Infinity,
      dropdownCssClass: "sfthFormDropdown",
      placeholder: window.KASKUS_lang.tag_placeholder,
      sorter: (data) => data.sort((a, b) => a.selected < b.selected),
    });
  }

  $("#edit-profile-gender").select2({
    minimumResultsForSearch: Infinity,
    placeholder: "Pilih jenis kelamin",
  });

  $("#edit-profile-country").select2({
    minimumResultsForSearch: 5,
    placeholder: "Pilih negara",
  });

  $("#edit-profile-province").select2({
    minimumResultsForSearch: 5,
    placeholder: "Pilih provinsi",
  });

  $("#user-options-badges").select2({
    minimumResultsForSearch: Infinity,
  });

  $("#user-options-comments").select2({
    minimumResultsForSearch: Infinity,
  });

  $("#user-options-subscription").select2({
    minimumResultsForSearch: Infinity,
  });

  $("#banDuration").select2({
    minimumResultsForSearch: Infinity,
    placeholder: "Pilih opsi lama waktu ban",
    dropdownCssClass: "banDurationDropdown",
  });

  $("#account-deactivation-reason").select2({
    minimumResultsForSearch: Infinity,
    placeholder: "Pilih alasan",
  });

  $("#account-deactivation-reason").on("select2:select", function (e) {
    var data = e.params.data;
    if (data.id === "Lainnya") {
      $(".jsDeactivationReasonTextarea").show();
    } else {
      $(".jsDeactivationReasonTextarea").hide();
    }
  });

  var communitySettingsKeyword = $(".communitySettingsKeyword");
  if (communitySettingsKeyword.length > 0) {
    communitySettingsKeyword.select2({
      minimumResultsForSearch: Infinity,
      tags: true,
      tokenSeparators: [","],
      dropdownCssClass: "communitySettingsKeywordDropdown",
    });
  }

  var communityCreateKeyword = $(".communityCreateKeyword");
  if (communityCreateKeyword.length > 0) {
    communityCreateKeyword.select2({
      minimumResultsForSearch: Infinity,
      tags: true,
      tokenSeparators: [","],
      dropdownCssClass: "communityCreateKeywordDropdown",
    });
  }

  const communityTerms = document.querySelectorAll(".jsCommunityTerms");
  communityTerms.forEach((communityTerm) => {
    communityTerm.addEventListener("click", function (e) {
      communityTerms.forEach((communityTerm) => {
        communityTerm.classList.remove("is-active");
      });
      communityTerm.classList.add("is-active");
    });
  });

  var communityDropdown = document.querySelector(
    ".communitySettingsKeywordDropdown"
  );

  if (communityDropdown) {
    communityDropdown.remove();
  }

  var editProfileBirthday = document.querySelector(".jsEditProfileBirthday");

  if (editProfileBirthday) {
    flatpickr(editProfileBirthday, {
      altInput: true,
      altFormat: "d-m-Y",
      dateFormat: "Y-m-d",
      maxDate: new Date(),
    });
  }

  $(".jsStarRating").click(function () {
    var index = $(this).data("star-index");
    $(this).addClass("is-active");
    $(".jsStarRating").removeClass("C(c-yellow-1)");
    for (var i = index; i > 0; i--) {
      $(".jsThreadRating")
        .find("[data-star-index='" + i + "']")
        .addClass("C(c-yellow-1)");
    }
  });

  $(".jsAdvancedReplyTextarea").keyup(function () {
    countChars($(".jsAdvancedReplyTextarea"), 20000);
  });

  $(".jsBlacklistTextarea").keyup(function () {
    countChars(
      $(".jsBlacklistTextarea"),
      $(".jsBlacklistTextarea").attr("maxLength")
    );
  });

  $(".jsCommunitySettingsTextarea").keyup(function () {
    countChars(
      $(".jsCommunitySettingsTextarea"),
      $(".jsCommunitySettingsTextarea").attr("maxLength")
    );
  });

  $(".jsVideoDescriptionTextarea").keyup(function () {
    countChars(
      $(".jsVideoDescriptionTextarea"),
      $(".jsVideoDescriptionTextarea").attr("maxLength")
    );
  });

  $(".jsCommunityRulesTextarea").keyup(function (handlers) {
    countChars(
      handlers.target,
      $(".jsCommunityRulesTextarea").attr("maxLength"),
      $(".jsCommunityRulesItem")
    );
  });

  $("#lapor-hansip-form")
    .find("textarea")
    .keyup(function () {
      countChars($(this), 1500);
    });

  function countChars(textarea, limit, container) {
    var limitChar = limit;
    var inputLength = textarea.val().length;
    var counter;
    if (container) {
      counter = textarea.closest(container).find($(".jsCharacterCounter"));
    } else {
      counter = $(".jsCharacterCounter");
    }
    counter.text(limitChar - inputLength);
    if (inputLength > limitChar) {
      counter.addClass("C(c-red)");
      counter.removeClass("C(c-tertiary)");
    } else {
      counter.addClass("C(c-tertiary)");
      counter.removeClass("C(c-red)");
    }
  }

  $(".jsExpandRemoveThread").click(function () {
    if ($(".jsExpandRemoveThreadContainer").hasClass("D(n)")) {
      showBlockElementByClass(".jsExpandRemoveThreadContainer");
    } else {
      hideElementByClass(".jsExpandRemoveThreadContainer");
    }
  });

  $(document).on("click", ".jsRepeaterButtonRemove", removeRepeaterItem);

  $(document).on("click", ".jsRepeaterButtonAdd", cloneRepeaterItem);
  if ($(".jsRepeaterItem").length == 2) {
    $(".jsRepeaterItem").find(".jsRepeaterButtonRemove").remove();
  }

  $("#jsToolbarSCEditor").on("click", ".createdPoll", function () {
    changeValueCreatedPoll(this);
  });
  $(".jsClosePolling").on("click", function () {
    changeValueCreatedPoll(this);
  });
  checkcreatedPoll();

  /**
   *Bind clicks close tooltip
   */
  $(".jsCloseBtn").click(function (event) {
    $(".jsTooltipReputation").removeClass("is-visible");
  });

  $(".jsModal").click(function (event) {
    if (!$(event.target).closest(".jsModalContent").length) {
      $(".jsModal").removeClass("is-open is-animate");
      $("body").removeClass("Ov(h)");
      resetInputAvatarAndCoverValue();
    }
  });

  if (typeof uploadAvatar === "function") {
    uploadAvatar();
  }

  if (typeof uploadAvatarSquare === "function") {
    uploadAvatarSquare();
  }

  if (typeof uploadCover === "function") {
    uploadCover();
  }

  scrollHeaderSticky();

  $(document).on("click", ".jsNgetopTabButton", function () {
    var indexElement = $(".jsNgetopTabButton").index(this);
    $(".jsNgetopTabButton").removeClass("is-active");
    $(this).addClass("is-active");
    $(".jsNgetopTabLine").css(
      "transform",
      "translateX(" + $(this).position().left + "px)"
    );
    $(".jsNgetopTabContent").css(
      "transform",
      "translateX(-" + indexElement * 100 + "%)"
    );
    $(".jsNgetopTabContent").css(
      "height",
      $(
        ".jsNgetopTabContent > div:nth-child(" + (indexElement + 1) + ")"
      ).height()
    );
  });

  if ($(".jsTabComponent").length) {
    $(".jsTabComponent").each(function () {
      var tabActive = $(this).find(".jsTabButton.is-active");
      var index = $(this).find(".jsTabButton").index(tabActive);
      $(this)
        .find(".jsTabLine")
        .css("width", tabActive.outerWidth() + "px");
      $(this)
        .find(".jsTabLine")
        .css("transform", "translateX(" + tabActive.position().left + "px)");
      $(this).find(".jsTabLine").show();
      $(this)
        .find(".jsTabComponentContent")
        .css("transform", "translateX(-" + index * 100 + "%)");
      $(this)
        .find(".jsTabComponentContent")
        .css(
          "height",
          $(
            ".jsTabComponentContent > div:nth-child(" + (index + 1) + ")"
          ).height()
        );
    });
  }

  $(document).on("click", ".jsTabButton", function () {
    var indexElement = $(".jsTabButton").index(this);
    $(this)
      .closest(".jsTabComponent")
      .find(".jsTabButton")
      .removeClass("is-active");
    $(this).addClass("is-active");
    $(this)
      .closest(".jsTabComponent")
      .find(".jsTabLine")
      .css("width", $(this).outerWidth() + "px");
    $(this)
      .closest(".jsTabComponent")
      .find(".jsTabLine")
      .css("transform", "translateX(" + $(this).position().left + "px)");
    $(this)
      .closest(".jsTabComponent")
      .find(".jsTabComponentContent")
      .css("transform", "translateX(-" + indexElement * 100 + "%)");
    $(this)
      .closest(".jsTabComponent")
      .find(".jsTabComponentContent")
      .css(
        "height",
        $(
          ".jsTabComponentContent > div:nth-child(" + (indexElement + 1) + ")"
        ).height()
      );
    if ($(".jsTabButton").hasClass("cendol is-active")) {
      $(this)
        .closest(".jsTabComponent")
        .find(".jsTabLine")
        .css("background-color", "#50ae5e");
      $(this)
        .parents()
        .closest(".modal-section")
        .find(".modal-header > div")
        .addClass("cendol");
      if ($(".modal-header > div").hasClass("bata")) {
        $(".modal-header > div").removeClass("bata");
      } else {
        $(".modal-header > div").removeClass("cendol");
      }
    } else if ($(".jsTabButton").hasClass("bata is-active")) {
      $(this)
        .closest(".jsTabComponent")
        .find(".jsTabLine")
        .css("background-color", "#d0021b");
      $(this)
        .parents()
        .closest(".modal-section")
        .find(".modal-header > div")
        .addClass("bata");
    } else {
      $(this)
        .closest(".jsTabComponent")
        .find(".jsTabLine")
        .css("background-color", "#0082c6");
    }
  });

  $(document).on("click", ".jsTabNav", function () {
    var indexElement = $(".jsTabNav").index(this);
    $(this).closest(".jsTabElement").find(".jsTabNav").removeClass("is-active");
    $(this).addClass("is-active");
    $(this)
      .closest(".jsTabElement")
      .find(".jsTabContent")
      .removeClass("is-show");
    $(this)
      .closest(".jsTabElement")
      .find(".jsTabContent")
      .eq(indexElement)
      .addClass("is-show");
  });

  /*
    bind onclick on link view all badges
   */
  $(".all-badges").on("click", function (e) {
    e.preventDefault();
    badge();
  });

  /*
    bind onclick on link view all moderated forum
   */
  $(".moderate-di").on("click", function (e) {
    e.preventDefault();
    moderate();
  });

  /*
    Initiated Search Connection
   */
  $("#pagination").html("");

  $("#search_connection")
    .unbind("click")
    .on("click", function () {
      searchConnection();
    });

  $("#search_connection_keyword")
    .unbind("keydown")
    .bind("keydown", function (event) {
      if (event.keyCode === 13) {
        searchConnection();
      }
    });

  var recommendedCommunitySwiper = new Swiper(".jsRecommendedCommunitySwiper", {
    slidesPerView: 2.5,
    spaceBetween: 16,
    navigation: {
      nextEl: ".jsRecommendedCommunitySwiper .jsWidgetButtonNext",
      prevEl: ".jsRecommendedCommunitySwiper .jsWidgetButtonPrev",
    },
  });

  // var otherCommunitySwiper = new Swiper(".jsOtherCommunitySwiper", {
  //   slidesPerView: 1,
  //   simulateTouch: false,
  //   pagination: {
  //     el: ".swiper-pagination",
  //     type: "bullets",
  //   },
  //   navigation: {
  //     nextEl: ".jsOtherCommunitySwiper .jsWidgetButtonNext",
  //     prevEl: ".jsOtherCommunitySwiper .jsWidgetButtonPrev",
  //   },
  // });

  var KaskusTvSwiper = new Swiper(".jsKaskusTvSwiper", {
    slidesPerView: "auto",
    navigation: {
      nextEl: ".jsKaskusTvSwiper .jsWidgetButtonNext",
      prevEl: ".jsKaskusTvSwiper .jsWidgetButtonPrev",
    },
  });

  KaskusTvSwiper.on("reachEnd", function () {
    $(".jsKaskusTvSwiper").addClass("is-end");
  });

  KaskusTvSwiper.on("fromEdge", function () {
    $(".jsKaskusTvSwiper").removeClass("is-end");
  });

  var hotTopicSwiper = new Swiper(".jsHotTopicSwiper", {
    slidesPerView: "auto",
    navigation: {
      nextEl: ".jsHotTopicSwiper .jsWidgetButtonNext",
      prevEl: ".jsHotTopicSwiper .jsWidgetButtonPrev",
    },
  });

  hotTopicSwiper.on("reachEnd", function () {
    $(".jsHotTopicSwiper").addClass("is-end");
  });

  hotTopicSwiper.on("fromEdge", function () {
    $(".jsHotTopicSwiper").removeClass("is-end");
  });

  var topCommunitySwiper = new Swiper(".jsTopCommunitySwiper", {
    slidesPerView: 1,
    navigation: {
      nextEl: ".jsTopCommunitySwiper .jsWidgetButtonNext",
      prevEl: ".jsTopCommunitySwiper .jsWidgetButtonPrev",
    },
  });

  var topForumSwiper = new Swiper(".jsTopForumSwiper", {
    slidesPerView: "auto",
    navigation: {
      nextEl: ".jsTopForumSwiper .jsWidgetButtonNext",
      prevEl: ".jsTopForumSwiper .jsWidgetButtonPrev",
    },
  });

  var liveSwiper = new Swiper(".jsLiveSwiper", {
    slidesPerView: "auto",
    pagination: {
      el: ".jsWidgetPagination",
      type: "bullets",
    },
    navigation: {
      nextEl: ".jsLiveSwiper .jsWidgetButtonNext",
      prevEl: ".jsLiveSwiper .jsWidgetButtonPrev",
    },
  });

  var topKreatorSwiper = new Swiper(".jsTopKreatorSwiper", {
    slidesPerView: "auto",
    navigation: {
      nextEl: ".jsTopKreatorSwiper .jsWidgetButtonNext",
      prevEl: ".jsTopKreatorSwiper .jsWidgetButtonPrev",
    },
  });

  $(document).on("click", ".jsThreadCardShare", function () {
    var others = $(".jsThreadCardShare").not(this);
    var thisElement = $(this);
    setTimeout(function () {
      others
        .closest(".jsThreadCard")
        .find(".jsShareBar")
        .removeClass("is-visible");
    }, 300);
    others
      .closest(".jsThreadCard")
      .find(".jsShareBarList")
      .removeClass("is-show");
    if (
      $(this)
        .closest(".jsThreadCard")
        .find(".jsShareBar")
        .hasClass("is-visible")
    ) {
      $(this)
        .closest(".jsThreadCard")
        .find(".jsShareBar")
        .removeClass("is-visible");
      $(this)
        .closest(".jsThreadCard")
        .find(".jsShareBarList")
        .removeClass("is-show");
    } else {
      $(this)
        .closest(".jsThreadCard")
        .find(".jsShareBar")
        .addClass("is-visible");
      $(this)
        .closest(".jsThreadCard")
        .find(".jsShareBarList")
        .addClass("is-show");
      var elShareBar = $(this).closest(".jsThreadCard").find(".jsShareBar");
      createHorizontalShareMenu(elShareBar);
    }
    return false;
  });

  $(document).on("click", ".jsThreadCardShareClose", function (e) {
    var thisElement = $(this);
    thisElement
      .closest(".jsShareBar")
      .find(".jsShareBarList")
      .removeClass("is-show");
    setTimeout(function () {
      thisElement.closest(".jsShareBar").removeClass("is-visible");
    }, 300);
    return false;
  });

  bindJsTippy();

  /*
  Init Datepicker
   */

  flatpickr(".jsDatepickerPolling", {
    minDate: new Date().fp_incr(1),
    dateFormat: "d-m-Y",
    locale: "id",
  });

  // var editorIcons = Quill.import('ui/icons');
  // editorIcons['bold'] = '<i class="fas fa-bold" aria-hidden="true"></i>';
  // editorIcons['italic'] = '<i class="fas fa-italic" aria-hidden="true"></i>';
  // editorIcons['align'][''] = '<i class="fas fa-align-left" aria-hidden="true"></i>';
  // editorIcons['align']['center'] = '<i class="fas fa-align-center" aria-hidden="true"></i>';
  // editorIcons['align']['right'] = '<i class="fas fa-align-right" aria-hidden="true"></i>';
  // editorIcons['underline'] = '<i class="D(ib) W(14px) H(14px) Bg(bgImageProps) Bgi(iconEditorUnderline) Va(m)"></i>';
  //
  // Quill.register('modules/characterCounter', function(quill, options) {
  //   var container = document.querySelector('.jsCharacterCounter');
  //   var limitChar = 20000;
  //   quill.on('text-change', function(delta,old,source) {
  //     var counter = quill.getLength();
  //     if (counter > limitChar) {
  //       quill.deleteText(limitChar, counter);
  //       counter = quill.getLength();
  //     }
  //     // There are a couple issues with counting words
  //     // this way but we'll fix these later
  //     container.innerText = limitChar - counter + 1;
  //   });
  // });
  //
  // var quill = new Quill('.jsCreateThreadContentEditor', {
  //   theme: 'snow',
  //   placeholder: 'Mulai Menulis!',
  //   modules: {
  //     toolbar: '#quillToolbar',
  //     characterCounter: true
  //   }
  // });

  $(".jsPilihKategori").select2();

  /*
    Init Clipboard function for Thread Detail Copy Link
   */
  var clipboard = new ClipboardJS(".jsClipboardButton");
  clipboard.on("success", function (e) {
    showBottomToast("Link Tersalin", "2000");
  });

  /*
    Init Hotkey Function
   */
  hotkeys(
    "shift+x, shift+r, shift+left, shift+right",
    function (event, handler) {
      switch (handler.key) {
        // Shift + X to Open Spoiler
        case "shift+x":
          $(".spoiler input[type=button]").click();
          break;
        // Shift + X to Reply Advanced
        case "shift+r":
          link = $(".jsButtonPostReply").attr("href");
          if (link) {
            window.location = link;
          }
          break;
        // Shift + Left to Prev Page
        case "shift+left":
          link = $(".pagination .jsPrevPage").attr("href");
          if (link) {
            window.location = link;
          }
          break;
        // Shift + Right to Next Page
        case "shift+right":
          link = $(".pagination .jsNextPage").attr("href");
          if (link) {
            window.location = link;
          }
          break;
      }
    }
  );

  $(".jsButtonSmilies").click(function () {
    if (!$(this).next($(".jsSmiliesContainer")).hasClass("is-visible")) {
      $(this).removeAttr("style");
      $(this).next($(".jsSmiliesContainer")).addClass("is-visible");
      $(this).css("color", "var(--c-blue-1)");
    } else {
      $(this).next($(".jsSmiliesContainer")).removeClass("is-visible");
      $(this).removeAttr("style");
    }
  });

  $(".jsButtonMention").click(function () {
    if (
      !$(this).parents().find($(".jsMentionContainer")).hasClass("is-visible")
    ) {
      $(this).removeAttr("style");
      $(this).parents().find($(".jsMentionContainer")).addClass("is-visible");
      $(this).css("color", "var(--c-blue-1)");
      $(this).addClass("active");
      setTimeout(function () {
        $(".jsMentionContainer input").focus();
      }, 310);
    } else {
      $(this)
        .parents()
        .find($(".jsMentionContainer"))
        .removeClass("is-visible");
      $(this).removeClass("active");
      $(this).removeAttr("style");
    }
  });

  $(document).on("click", ".jsSubscribeThreadIcon", function () {
    subscribeUnsubscribe($(this));
    return false;
  });

  $(".jsReplyTextArea").focus(function () {
    showReplyTools();
  });

  var lastElementClicked;

  $(document).mousedown(function (e) {
    lastElementClicked = $(e.target);
  });

  $(document).mouseup(function (e) {
    lastElementClicked = null;
  });

  $(".jsReplyTextArea").blur(function (e) {
    if (
      !$(lastElementClicked).closest(".jsReplyTools").length &&
      !$(lastElementClicked).closest(".jsButtonReply").length
    ) {
      if (
        $(".jsReplyTextArea").length &&
        $(".jsReplyTextArea").val().length == 0
      ) {
        $(".jsReplyTools").hide();
        $(".jsReplyUser").addClass("Pos(a)");
        $(".jsReplyUser span").hide();
        $(".jsReplyTextArea").addClass("Px(40px)");
      }
    }
  });

  $(".jsBBNumberList").click(function () {
    createNumberList(".jsAdvancedReplyTextarea");
  });

  function createNumberList(textarea) {
    swal("Masukkan Angka Awal:", {
      content: "input",
    }).then((value) => {
      if (value !== null) {
        insertBBCode("[list=" + value + "]\n[*]", "\n[/list]", textarea);
      }
    });
  }

  autosize($(".jsReplyTextArea"));
  autosize($(".jsNestedReplyTextArea"));

  /*
    Click event toggling
   */
  // $('.jsCompactTrigger').click(function(){
  //   if(!$('body').hasClass('is-compact')){
  //     $('body').addClass('is-compact');
  //     $(this).find('i').addClass('fa-list-ul').removeClass('fa-th-large');
  //   }
  //   else{
  //     $('body').removeClass('is-compact');
  //     $(this).find('i').addClass('fa-th-large').removeClass('fa-list-ul');
  //   }
  // });

  bindPopoverMenu();

  bindThreadListShareMenuData();

  //scrollHeaderSticky();

  $(".is-remove-all").mousedown(function (e) {
    e.preventDefault();
  });

  $(document).on("click", ".jsModalTrigger", function () {
    $(".jsModal").removeClass("is-open");
    var modalTarget = $(this).attr("data-modal");
    var modalElement = $("#" + modalTarget);
    modalElement.addClass("is-open");
    modalElement.find(".jsModalDialog").addClass("is-animate");
    $("body").addClass("Ov(h)");
    // if (modalElement.find('.jsTabComponent').hasClass('modalWhoCendoled')) {
    //   $('.jsTabComponent').find('.cendol').trigger('click');
    //   $('.modal-section').find('.modal-header > div').addClass('cendol');
    // }
  });

  $(".jsBadgeAdd").click(function () {
    var container = $(this).closest(".jsBadgeContainer").find(".jsBadgeSelect");
    selectBadge(container);
  });

  $(".jsBadgeSelect").click(function () {
    selectBadge(this);
  });

  $(".jsBadgeStatus").click(function () {
    $(this).closest(".jsBadgeContainer").removeClass("is-selected");
    $(this)
      .closest(".jsBadgeContainer")
      .find("img")
      .attr("src", assetsFolderNew + "/images/default_badge.png");
    $(this).find(".jsBadgeAdd").removeClass("D(n)");
    $(this).find(".jsBadgeAdd").addClass("D(f)");
    $(this).find(".jsBadgeRemove").addClass("D(n)");
    $(this).find(".jsBadgeRemove").removeClass("D(f)");
  });

  var chooseBadge = document.querySelector("#user-options-badges");
  if (chooseBadge) {
    chooseBadge.onchange = function () {
      var selected = chooseBadge.options[chooseBadge.selectedIndex].value;
      if (selected === "badge") {
        $(".jsBadgeChooser").removeClass("D(n)");
      } else {
        $(".jsBadgeChooser").addClass("D(n)");
      }
    };
  }

  $(document).on("click", ".jsModalCloseButton", function () {
    closeModal();
  });

  $(".mls-img").kslzy(300);

  /*
     Bind Click Button on BUtton channel List
  */
  $("body").on("click", ".jsChannelForumButton", function () {
    if ($(this).closest(".jsChannelForumItem").hasClass("is-open")) {
      $(this).closest(".jsChannelForumItem").removeClass("is-open");
      $(this)
        .find("i")
        .removeClass("fa-minus-circle")
        .addClass("fa-plus-circle");
      $(this)
        .closest(".jsChannelForumItem")
        .find(".jsChannelForumList")
        .slideUp();
    } else {
      $(this).closest(".jsChannelForumItem").addClass("is-open");
      $(this)
        .find("i")
        .removeClass("fa-plus-circle")
        .addClass("fa-minus-circle");
      $(this)
        .closest(".jsChannelForumItem")
        .find(".jsChannelForumList")
        .slideDown();
    }
  });

  if ($(".flyout__trigger").length > 0) {
    $(".flyout__trigger").hover(function () {
      if (!catLoaded) {
        fetchCategories();
      }
    });
  }

  $("body").on("click", ".jsFormPasswordToggle", function () {
    var formPasswordInput = $(this)
      .closest(".jsFormPassword")
      .find(".jsFormPasswordInput");
    var formPasswordIcon = $(this).closest(".jsFormPassword").find("i");
    if (formPasswordInput.attr("type") == "text") {
      var isPassword = false;
    } else {
      var isPassword = true;
    }

    if (isPassword) {
      formPasswordIcon.removeClass("fa-eye");
      formPasswordIcon.addClass("fa-eye-slash");
      formPasswordInput.attr("type", "text");
    } else {
      formPasswordIcon.removeClass("fa-eye-slash");
      formPasswordIcon.addClass("fa-eye");
      formPasswordInput.attr("type", "password");
    }
  });

  var createPostOptionsModal = document.querySelector(
    ".jsCreatePostOptionsTrigger"
  );

  var overlay = document.querySelector(".jsBackgroundOverlay");
  var closeIcon = document.querySelector(".jsCloseIconGeneral");

  if (createPostOptionsModal) {
    createPostOptionsModal.addEventListener("click", function () {
      var modal = document.querySelector(".jsCreatePostOptions");
      showBlockElementByClass(modal);
      showBlockElementByClass(overlay);
      document.querySelector("body").style.overflow = "hidden";
    });
  }

  if (closeIcon) {
    closeIcon.addEventListener("click", closeRelativeModal);
  }
  if (overlay) {
    overlay.addEventListener("click", closeRelativeModal);
  }

  function closeRelativeModal(inputElem) {
    var uploadField = document.getElementById(inputElem);
    if (uploadField) {
      uploadField.value = "";
    }

    var modals = document.querySelectorAll(".modal-relative");
    modals.forEach((modal) => {
      hideElementByClass(modal);
    });
    hideElementByClass(overlay);
    document.querySelector("body").style.overflow = "auto";
  }

  openPreviewModal("#uploadMedia");

  function openPreviewModal(element) {
    var elem = document.querySelector(element);
    if (elem) {
      elem.addEventListener("change", function () {
        showFlexElementByClass(".jsUploadedMediaPreview");
        showBlockElementByClass(overlay);
        document.querySelector("body").style.overflow = "hidden";
        PreviewImage(element);
      });
    }
  }

  function PreviewImage(element) {
    var oFReader = new FileReader();
    oFReader.readAsDataURL(document.querySelector(element).files[0]);

    oFReader.onload = function (oFREvent) {
      document.getElementById("uploadPreview").src = oFREvent.target.result;
    };
  }

  var previewImageSlider = new Swiper(".jsPreviewImageSlider", {
    slidesPerView: 1,
    pagination: {
      el: ".jsPreviewPagination",
      type: "bullets",
    },
    navigation: {
      nextEl: ".jsPreviewImageSlider .jsPreviewButtonNext",
      prevEl: ".jsPreviewImageSlider .jsPreviewButtonPrev",
    },
    on: {
      init: function () {
        document.querySelector(".jsSlideCounter").innerText =
          "1/" + this.slides.length;
      },
      slideChange: function () {
        slideCounter(
          document.querySelector(".jsPreviewImageSlider"),
          previewImageSlider,
          ".jsSlideCounter"
        );
      },
    },
  });

  var addImageButton = document.querySelector(".jsEmbedImageToThread");

  if (addImageButton) {
    addImageButton.addEventListener("click", function () {
      var url = document.getElementById("uploadPreview").src.split(",").pop();
      var caption = document.getElementById("uploadedMediaCaption").value;
      document.getElementById("uploadedMediaCaption").value = "";

      const byteCharacters = window.atob(url);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      var imageUrl = URL.createObjectURL(blob);

      if (caption === "") {
        sceditorInstance.insert("<img src='" + imageUrl + "' />", null, false);
      } else {
        sceditorInstance.insert(
          "<div style='text-align: center'><img src='" +
          imageUrl +
          "' /></div><div style='text-align: center'>" +
          caption +
          "</div>",
          null,
          false
        );
      }

      closeRelativeModal("uploadMedia");
    });
  }

  function slideCounter(element, slider, counter) {
    var counter = document.querySelector(".jsSlideCounter");
    var slides = element.querySelectorAll(".swiper-slide");
    counter.innerText = slider.activeIndex + 1 + "/" + slides.length;
  }

  $(".jsFirstPostItemTrigger").click(function () {
    if (!$(".jsFirstPostItemContent").hasClass("is-hide")) {
      $(".jsFirstPostItemContent").addClass("is-hide");
      $(".jsFirstPostItemContent").slideUp();
      $(this).find("i").removeClass("fa-angle-up").addClass("fa-angle-down");
      $(this).find("span").text("Lihat Isi Thread");
      $("html, body").animate(
        {
          scrollTop: $(".jsFirstPostItemContent").offset().top - 300,
        },
        400
      );
    } else {
      $(".jsFirstPostItemContent").removeClass("is-hide");
      $(".jsFirstPostItemContent").slideDown();
      $(this).find("i").removeClass("fa-angle-down").addClass("fa-angle-up");
      $(this).find("span").text("Sembunyikan Isi Thread");
    }
  });

  $("#thread_post_list").on(
    "click",
    ".jsShowNestedTrigger",
    function (element) {
      var nestedItemTotal = $(this).attr("data-replycount");

      if (!$(this).parent().next().hasClass("is-hide")) {
        $(this).parent().next().addClass("is-hide");
        $(this).parent().next().slideUp();
        $(this).find("i").removeClass("fa-angle-up").addClass("fa-angle-down");
        $(this)
          .find("span")
          .text("Lihat " + nestedItemTotal + " balasan");
      } else {
        $(this).parent().next().removeClass("is-hide");
        $(this).parent().next().slideDown();
        $(this).find("i").removeClass("fa-angle-down").addClass("fa-angle-up");
        $(this).find("span").text("Tutup Balasan");
      }
    }
  );

  $(".jsSpoilerTrigger").click(function (event) {
    $(this).closest(".jsSpoiler").toggleClass("is-open");
    $(this).find("i").toggleClass("fa-angle-down fa-angle-up");
    if ($(this).closest(".jsSpoiler").hasClass("is-open")) {
      $(this).find("span").text("Hide");
      $(this)
        .closest(".jsSpoiler")
        .find(".jsSpoilerContent")
        .first()
        .slideDown();
    } else {
      $(this).find("span").text("Show");
      $(this).closest(".jsSpoiler").find(".jsSpoilerContent").first().slideUp();
    }
  });

  $(".jsTabLink").click(function () {
    var tabId = $(this).attr("data-tab");

    $(".jsTabLink, .jsTabContent").removeClass("is-active");

    $(this).addClass("is-active");
    $("#" + tabId).addClass("is-active");
  });

  $(".jsSearchStickyWrapper").css(
    "width",
    $(".jsCategoryContainer").width() + 30
  );
  $(".jsStickyHeader .jsSearchStickyWrapper").css(
    "width",
    $(".ListChannel-sticky").width() * 0.67
  );

  $(".jsSearchFormInput").focus(function () {
    $(".jsSearchResult").addClass("is-open");
    $(".jsNavHeaderOverlay").show();
    $(".jsSearchStickyWrapper").css("min-height", "700px");
    //$('.jsNavHeaderOverlay').css('top', ($('.jsNavHeader').offset().top + 90 - $(window).scrollTop())+'px');
  });

  $(".jsSearchFormInput").blur(function () {
    $(".jsSearchResult").removeClass("is-open");
    $(".jsNavHeaderOverlay").hide();
    $(".jsSearchStickyWrapper").css("min-height", "30px");
  });

  $(".jsModalCloseButton").click(function () {
    $(".jsModal").removeClass("is-open");
    $("body").removeClass("Ov(h)");
  });

  $("#search").keydown(function (event) {
    $(".jsSearchResult").find("li").removeClass("Bgc(c-semiwhite)");
    if (event.which != 13) {
      $("#searchform").removeAttr("data-url");
    }
    var totalIndex = $(".jsSearchResult .jsSearchWrapper li").length - 1;
    var fidterm = "";
    var selectedElement =
      ".jsSearchResult .jsSearchWrapper li:eq(" + indexSelected + ")";
    if ($(selectedElement).find("a").hasClass("categorySearch")) {
      if ($(selectedElement).find("a").attr("data-forum-id") !== undefined) {
        if (event.which == 13) {
          event.preventDefault();
          fidterm = $(selectedElement).find("span").text();
          fidterm +=
            " fid:" + $(selectedElement).find("a").attr("data-forum-id");
          window.location.href = "/search/forum/?q=" + escape(fidterm);
        }
      }
    }
    if (event.which == 38) {
      if (indexSelected > 0) {
        indexSelected--;
      } else {
        indexSelected = totalIndex;
      }
      setSelectedSearch();
      return false;
    } else if (event.which == 40) {
      if (indexSelected < totalIndex) {
        indexSelected++;
      } else {
        indexSelected = 0;
      }
      setSelectedSearch();
    } else {
      updateSearchResult = true;
    }
  });

  function setSelectedSearch() {
    var selectedElement =
      ".jsSearchResult .jsSearchWrapper li:eq(" + indexSelected + ")";
    var selectedElementValue;
    if ($(selectedElement).find("a").hasClass("categorySearch")) {
      selectedElementValue = $(selectedElement).find("span").text();
    } else if ($(selectedElement).find("a").hasClass("forumSearch")) {
      selectedElementValue = $(selectedElement).find("a #forum_name").text();
      if ($(selectedElement).find("a").attr("data-url") !== undefined) {
        $("#searchform").attr(
          "data-url",
          $(selectedElement).find("a").attr("data-url")
        );
      }
    } else if ($(selectedElement).find("a").hasClass("threadSnippetSearch")) {
      selectedElementValue = $(selectedElement).find("a #thread_title").text();
      if ($(selectedElement).find("a").attr("data-url") !== undefined) {
        $("#searchform").attr(
          "data-url",
          $(selectedElement).find("a").attr("data-url")
        );
      }
    } else {
      selectedElementValue = $(selectedElement).find("a").text();
      $("#searchform").removeAttr("data-url");
    }

    $("#search").val(selectedElementValue);
    $(selectedElement).addClass("Bgc(c-semiwhite)");
    $("#search").attr("value", selectedElementValue);
    $("#search").blur();
    $("#search").focus();
    updateSearchResult = false;
  }

  $(".jsUserAvatar").click(function () {
    if ($(".toggleMenu").hasClass("is-visible")) {
      $(".toggleMenu").removeClass("is-visible");
      $(".jsNavHeaderOverlay").hide();
      $(".jsUserMenu").removeClass("is-active");
      $(".jsNotificationMenu").removeClass("is-active");
    } else {
      $(this).next().toggleClass("is-visible");
      toggleOverlay();
      $(".jsUserMenu").addClass("is-active");
    }
  });

  $(".jsNotificationIcon").click(function () {
    if ($(".toggleMenu").hasClass("is-visible")) {
      $(".toggleMenu").removeClass("is-visible");
      $(".jsNavHeaderOverlay").hide();
      $(".jsNotificationMenu").removeClass("is-active");
      $(".jsUserMenu").removeClass("is-active");
    } else {
      $(this).next().toggleClass("is-visible");
      toggleOverlay();
      $(".jsNotificationMenu").addClass("is-active");
    }
  });

  $(document).on("click", function (event) {
    if (
      !$(event.target).closest(
        ".jsPopover, .jsUserMenu, .jsNotificationMenu, .jsFlyoutMenu, .jsSearchOutterWrapper, .jsSearchStickyBtn,  .jsReplyTools, #jsReplyTextArea, .jsSmilies, .jsMention, .jsBBMention, .jsBBFontColor, .jsBBFontName, .jsBBFontSize, .jsSearchAnchorSticky, .sceditor-button-media"
      ).length
    ) {
      $(".jsPopoverMenu").removeClass("is-visible");
      $(".jsPopoverTrigger").removeClass("C(c-blue").addClass("C(c-primary)");
      $(".jsSmiliesContainer").removeClass("is-visible");
      $(".jsButtonSmilies").removeAttr("style");
      $(".jsMentionContainer").removeClass("is-visible");
      $(".jsButtonMention").removeAttr("style");
      $(".jsButtonMention").removeClass("active");
      $(".jsUserDropdownMenu").removeClass("is-visible");
      $(".jsUserMenu").removeClass("is-active");
      $(".jsNotificationDropdownMenu").removeClass("is-visible");
      $(".jsNotificationMenu").removeClass("is-active");
      $(".jsSearchSticky").removeClass("is-clicked");
      $(".jsSearchTrigger").removeClass("is-clicked");
      $(".jsSearchOutterWrapper").hide();
      $(".jsBBColorPicker, .jsBBSizePicker, .jsBBFontPicker").addClass("D(n)");
      if ($(".jsNavHeaderOverlay").css("display") == "block") {
        $(".jsNavHeaderOverlay").hide();
      }

      // Remove these comment when create MMT web is needed
      // $(".jsEmbedMediaForm").hide();
      // $(".sceditor-button-media").removeClass("active");
    }
  });

  // $('.jsSidebarLeft').stickySidebar({
  //     innerWrapperSelector: '.jsSidebarLeftInner',
  //     topSpacing: 100,
  //     bottomSpacing: 60
  // });
  //
  // $('.jsSidebarRight').stickySidebar({
  //     innerWrapperSelector: '.jsSidebarRightInner',
  //     topSpacing: 100,
  //     bottomSpacing: 60
  // });

  // $(".jsStickyColumn").stick_in_parent({
  //   parent: ".jsStickyParent",
  //   spacer: ".jsStickySpacer",
  //   offset_top: 60
  // });

  // $('.').stickybits();
  // stickybits('.jsStickyColumn', {verticalPosition: 'bottom'});

  stickybits(".jsStickyAnchor", { stickyBitStickyOffset: 60 });
  stickybits(".jsToolbarSCEditorAnchor", {
    verticalPosition: "bottom",
    useStickyClasses: true,
  });

  //scrollHeader();

  // Accordion
  var menuAccordion = $(".jsMenuAccordion");

  menuAccordion
    .children("ul")
    .find("a")
    .click(function () {
      var checkElement = $(this).next();
      if (checkElement.is("ul")) {
        if (checkElement.is(":visible")) {
          $(this).closest("li").removeClass("is-open");
          $(this)
            .find(".jsMenuAccordionIcon")
            .toggleClass("fa-angle-down fa-angle-up");
          checkElement.slideUp();
        } else {
          menuAccordion.children("ul").find("ul:visible").slideUp();
          menuAccordion.find("li").removeClass("is-open");
          menuAccordion
            .find(".jsMenuAccordionIcon")
            .removeClass("fa-angle-up")
            .addClass("fa-angle-down");
          $(this).closest("li").addClass("is-open");
          $(this)
            .find(".jsMenuAccordionIcon")
            .toggleClass("fa-angle-down fa-angle-up");
          checkElement.slideDown();
        }
      }

      if ($(this).closest("li").find("ul").children().length === 0) {
        return true;
      } else {
        return false;
      }
    });

  $("#koin-amount").select2({
    minimumResultsForSearch: Infinity,
  });

  var koinCalendarStart = document.querySelector(".jsKoinDateFrom");
  var koinCalendarEnd = document.querySelector(".jsKoinDateUntil");

  if (koinCalendarStart) {
    flatpickr(koinCalendarStart, {
      altInput: true,
      altFormat: "d-m-Y",
      dateFormat: "Y-m-d",
      maxDate: new Date(),
      onChange: function (selectedDates) {
        koinCalendarEnd._flatpickr.set("minDate", selectedDates[0]);
      },
    });
  }

  if (koinCalendarEnd) {
    flatpickr(koinCalendarEnd, {
      altInput: true,
      altFormat: "d-m-Y",
      dateFormat: "Y-m-d",
      maxDate: new Date(),
      onChange: function (selectedDates) {
        koinCalendarStart._flatpickr.set("maxDate", selectedDates[0]);
      },
    });
  }

  var showChar = 101;
  var ellipsestext = "...";
  var moretext = "See more";
  var lesstext = "See less";
  $(".description p").each(function () {
    var content = $(this).html();

    if (content.length > showChar) {
      var c = content.substr(0, showChar);
      var h = content.substr(showChar, content.length - showChar);

      var html =
        c +
        '<span class="moreelipses">' +
        ellipsestext +
        '</span><span class="morecontent"><span>' +
        h +
        '</span>&nbsp;<a href="" class="morelink">' +
        moretext +
        "</a></span>";

      $(this).html(html);
    }
  });

  $(".morelink").click(function () {
    if ($(this).hasClass("less")) {
      $(this).removeClass("less");
      $(this).html(moretext);
    } else {
      $(this).addClass("less");
      $(this).html(lesstext);
    }
    $(this).parent().prev().toggle();
    $(this).prev().toggle();
    return false;
  });

  $(".searchIcon").click(function () {
    $(".searchIcon").hide();
    $(".jsSearchContainer").css("display", "flex");
    $(".searchInput").animate(
      {
        width: "100%",
      },
      500,
      function () {
        $(".jsSearchContainer input:text").focus();
        $(".searchResult").show();
        $(".jsNavHeaderOverlay").show();
      }
    );
  });

  $(".searchIconSticky").click(function () {
    $(".searchIconSticky").hide();
    $(".jsSearchContainer").css("display", "flex");
    $(".searchInput").animate(
      {
        width: "100%",
      },
      500,
      function () {
        $(".jsSearchContainer input:text").focus();
        $(".searchResult").show();
        $(".jsNavHeaderOverlay").show();
      }
    );
  });

  $(document).click(function (e) {
    $(".searchResult").hide();
    $(".searchInput").animate(
      {
        width: "28px",
      },
      500,
      function () {
        $(".searchIcon, .searchIconSticky").show();
        $(".jsSearchContainer").css("display", "none");
      }
    );
  });

  $(".searchResult,.jsSearchContainer, .searchIcon, .searchIconSticky").click(
    function (e) {
      e.stopPropagation();
      $(".jsNavHeaderOverlay").show();
      $(".jsSearchContainer input:text").focus();
    }
  );

  $('#jsExploreCommunity').click(function () {
    openModal('jsModalOnboardingAfterSignup');
  });

  $('.tag').click(function () {
    $(this).toggleClass('is-active');
    checkBoxes = $(this).find('input[type=checkbox]');
    checkBoxes.prop("checked", !checkBoxes.prop("checked"));
    if ($('.tag.is-active').length > 2) {
      $('#next-button-onboarding').addClass('C(c-white) Bgc(c-blue)').removeClass('C(c-grey) Bgc(c-gray-2) Cur(d)').removeAttr('disabled');
    } else {
      $('#next-button-onboarding').addClass('C(c-grey) Bgc(c-gray-2) Cur(d)').removeClass('C(c-white) Bgc(c-blue)').attr('disabled');
    }
  });

  $('#next-button-onboarding').click(function () {
    if ($('.tag.is-active').length > 2) { 
      var formAction = $("#select_channel").attr("action");
      var formData = $("#select_channel").serialize();
      $.ajax({
        url: formAction,
        dataType: "json",
        type: "post",
        data: formData,
        success: function (response) {
          if (typeof response !== "object") {
            response = $.parseJSON(response);
          }
          $('#onboarding-step-2').html(response.html);
          $('#onboarding-step-1').addClass('D(n)');
          $('#onboarding-step-2').removeClass('D(n)');
          $('.modal-indicator').first().addClass('Bgc(c-gray-4)').removeClass('Bgc(c-gray-7)');
          $('.modal-indicator').last().addClass('Bgc(c-gray-7)').removeClass('Bgc(c-gray-4)');
        },
      });
    }
  });
  $(".jsConnectWalletDropdown").select2({
    minimumResultsForSearch: Infinity,
    placeholder: "Pilih Wallet",
    dropdownCssClass: "connectWalletDropdownCSS",
    templateResult: function (res) {
      var src = $(res.element).data("src");
      var $span = $(
        "<div class='D(f) Jc(fs) Ai(c)'><img style='width: 14px;' src='"  +
          src +
           "' /><span class='Pstart(8px)'>" +
          res.text +
          "</span></div>"
      );
      return $span;
    },
  });

  bindOnboardingStep2();
  forumAllEventTracking();
  bindForumAllIconCancel();
  bindForumAllSearchResult();
  bindForumAllSubscribeEvent();
  bindTopKreatorClickFollowBtn();
  bindTopKreatorHoverFollowBtn();
  bindShowOrHideSelect2Dropdown();
});
