
var rfs = require("../lib/rfs");

exports.name = "fork-ruby";
exports.landscape = "W3C HTML has a ruby model that matches both users' needs and implementations.";
exports.transform = function (data) {
    // remove from obsolete
    var $objDT = $("#rb").parent();
    $objDT.next("dd").remove();
    $objDT.remove();
    
    // replace element sections
    [
        "closing-elements-that-have-implied-end-tags"
    ,   "the-rp-element"
    ,   "the-rt-element"
    ,   "the-ruby-element"
    ].forEach(function (sec) { $("#" + sec).parent().replaceWith(data[sec]); });
    $("#the-ruby-element").parent().after(data["the-rb-element"]);
    $("#the-rt-element").parent().after(data["the-rtc-element"]);

    // various changes to the parsing algorithm
    var $og = $("#parsing-main-inbody")
                    .parent()
                    .find("dl.switch:first dt:contains('\"math\"'):first")
    ;
    // remove previous variant
    $og.prev("dd").remove();
    $og.prev("dt").remove();
    $og.before(data.stRbRtc);
    $og.before(data.stRbRtcDD);
    $og.before(data.stRtRp);
    $og.before(data.stRtRpDD);

    var $eof = $("#parsing-main-inbody")
                    .parent()
                    .find("dl.switch:first dt:contains('end-of-file'):first")
    ;
    $eof.next("dd").find("ol li:first").html(data.eof);
    $eof.nextAll("dt:contains('body'):first, dt:contains('html'):first")
        .each(function () {
            $(this).next("dd").find("p:eq(1)").html(data.eofOtherwise);
        })
    ;

    // rendering
    var $phrasingCSS = $("#phrasing-content-3").parent().find("pre.css:first");
    $phrasingCSS.html($phrasingCSS.html().replace(/ruby[\s\S]+?rt[\s\S]+?\}/, data.css));
    
    // table of elements
    var $qTR = $("#elements-3").parent().find("table:first tr:contains('Quotation')");
    $qTR.after(data.elRB);
    $qTR
        .next("tr")
        .next("tr") // rp
        .find("td:eq(2) code:contains('ruby')")
        .after('<code><a href="#the-rtc-element">rtc</a></code>')
        .after(document.createTextNode("; "))
    ;
    var $rtTR = $qTR.next("tr").next("tr").next("tr");
    $rtTR
        .find("td:eq(2) code:contains('ruby')")
        .after('<code><a href="#the-rtc-element">rtc</a></code>')
        .after(document.createTextNode("; "))
    ;
    $rtTR.after(data.elRTC);
    $rtTR
        .next("tr")
        .next("tr") // ruby
        .find("td:eq(3) code:contains('rp')")
        .after('<code><a href="#the-rb-element">rb</a></code>')
        .after(document.createTextNode("; "))
        .after('<code><a href="#the-rtc-element">rtc</a></code>')
        .after(document.createTextNode("; "))
    ;
    
    // table of interfaces
    var $rpTr = $("#element-interfaces")
                    .parent()
                    .find("table:first a[href='#the-rp-element']")
                    .parent().parent().parent()
    ;
    $rpTr.before(data.ifRB);
    $rpTr.next("tr").after(data.ifRTC);
    
    // usage summary
    $("#usage-summary")
        .parent()
        .find("table:first tr:contains('ruby'):first")
        .replaceWith(data.usage)
    ;

    // optional end tags
    var $ogp = $("#optional-tags").parent().find("p:contains('optgroup'):first");
    $ogp.prev("p").remove();
    $ogp.prev("p").remove();
    $ogp.before(data.optionalRB);
    $ogp.before(data.optionalRT);
    $ogp.before(data.optionalRTC);
    $ogp.before(data.optionalRP);
    
    // HTMLUnknownElement
    var $rb = $("#other-elements\\,-attributes-and-apis\\:rb")
    ,   $rbParent = $rb.parent()
    ;
    $rb.remove();
    $rbParent.html($rbParent.html().replace(/,\s+,/, ", "));
};
exports.params = function () {
    return [{
    // sections
        "closing-elements-that-have-implied-end-tags":  rfs("res/ruby/closing-elements-that-have-implied-end-tags.html")
    ,   "the-rb-element":       rfs("res/ruby/the-rb-element.html")
    ,   "the-rp-element":       rfs("res/ruby/the-rp-element.html")
    ,   "the-rt-element":       rfs("res/ruby/the-rt-element.html")
    ,   "the-rtc-element":      rfs("res/ruby/the-rtc-element.html")
    ,   "the-ruby-element":     rfs("res/ruby/the-ruby-element.html")
    // parsing
    ,   stRbRtc:        rfs("res/ruby/st-rb-rtc.html")
    ,   stRbRtcDD:      rfs("res/ruby/st-rb-rtc-dd.html")
    ,   stRtRp:         rfs("res/ruby/st-rt-rp.html")
    ,   stRtRpDD:       rfs("res/ruby/st-rt-rp-dd.html")
    // optional tags
    ,   optionalRB:     rfs("res/ruby/optional-rb.html")
    ,   optionalRT:     rfs("res/ruby/optional-rt.html")
    ,   optionalRTC:    rfs("res/ruby/optional-rtc.html")
    ,   optionalRP:     rfs("res/ruby/optional-rp.html")
    // end-of-file
    ,   eof:            rfs("res/ruby/eof.html")
    ,   eofOtherwise:   rfs("res/ruby/eof-otherwise.html")
    // tables
    ,   usage:          rfs("res/ruby/usage.html")
    ,   ifRB:           rfs("res/ruby/if-rb.html")
    ,   ifRTC:          rfs("res/ruby/if-rtc.html")
    ,   elRB:           rfs("res/ruby/el-rb.html")
    ,   elRTC:          rfs("res/ruby/el-rtc.html")
    // rendering
    ,   css:            rfs("res/ruby/ruby.css")
    }];
};
exports.copy = {
    "ruby/images/composition.png":              "images/composition.png"
,   "ruby/images/group.png":                    "images/group.png"
,   "ruby/images/hokekyou.png":                 "images/hokekyou.png"
,   "ruby/images/group-double.png":             "images/group-double.png"
,   "ruby/images/mono-or-jukugo-double.png":    "images/mono-or-jukugo-double.png"
};
