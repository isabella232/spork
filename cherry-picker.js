#!/usr/bin/env node

var spork = require("./spork")
,   fs = require("fs-extra")
,   pth = require("path")
,   exec = require("child_process").exec
,   jn = pth.join
,   nopt = require("nopt")
,   email   = require("emailjs")
,   Octokit = require("octokit")
,   gh = Octokit.new()
,   knownOpts = {
                config: pth
            ,   force:  Boolean
            ,   quiet:  Boolean
    }
,   shortHands = {
                f:      ["--force"]
            ,   c:      ["--config"]
            ,   q:      ["--quiet"]
    }
,   options = nopt(knownOpts, shortHands, process.argv, 2)
,   config = require(options.config)
,   cacheFile = jn(config.outDir, "last-html-sha.txt")
;

if (options.quiet) config.quiet = true;
var log = require("./lib/logger").getLog(config);

function nullifyCache () {
    log.info("Creating/resetting cache file: " + cacheFile);
    fs.writeFileSync(cacheFile, "this is not a sha", "utf8");
}
if (!fs.existsSync(cacheFile)) nullifyCache();

// produce a reporter
var reporter = function (subject, failMessage) {
    if (config.email) {
        var em = config.email
        ,   message = email.message.create({
                from:       em.from
            ,   to:         em.to
            ,   subject:    subject
            ,   text:       failMessage
        });
        email.server
            .connect({
                user:       em.username
            ,   password:   em.password
            ,   port:       em.port
            ,   host:       em.host
            ,   ssl:        em.ssl
            ,   tls:        em.tls
            })
            .send(
                message
            ,   function (err) {
                    if (err) log.error("EMAIL: " + err);
                    log.info("Reported okay");
                }
            )
        ;
    }
};

// run spork
function run () {
    log.info("Running Spork");
    spork.run(
        require("./profiles/html")
    ,   config
    ,   reporter
    );
}
if (options.force) return run();

// check last commit
var repo = gh.getRepo("whatwg", "html-mirror");
repo.getCommits()
    .then(function (commits) {
        var lastRun = fs.readFileSync(cacheFile, "utf8")
        ,   lastCommit = commits[0].sha
        ;
        log.info("Last processed commit: " + lastRun + ", last GH commit: " + lastCommit);
        if (lastCommit !== lastRun) {
            fs.writeFileSync(cacheFile, lastCommit, "utf8");
            run();
        }
        else {
            log.info("Nothing to report, going back to sleep.");
        }
    })
;

// check for self-updates
if (config.production) {
    var repo = gh.getRepo("darobin", "spork");
    repo.getCommits()
        .then(function (commits) {
            exec("git log -1", { cwd: __dirname }, function (err, stdout) {
                if (err) log.error("Problem getting the git log: " + err);
                var lastRun = stdout.replace(/^commit\s+/, "").replace(/\n[\s\S]+/, "")
                ,   lastCommit = commits[0].sha
                ;
                log.info("Last fetched commit: " + lastRun + ", last GH commit: " + lastCommit);
                if (lastCommit !== lastRun) {
                    exec("git pull", { cwd: __dirname }, function (err) {
                        if (err) log.error("Problem updating spork code: " + err);
                        nullifyCache();
                        log.info("Spork updated");
                    });
                }
                else {
                    log.info("Nothing to update.");
                }
            });
        })
    ;
}
