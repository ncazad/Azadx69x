const fs = require("fs");
const path = require("path");

function patchFile(filePath, patches) {
    if (!fs.existsSync(filePath)) {
        console.log(`patch-fca: ${path.basename(filePath)} not found, skipping.`);
        return;
    }
    let code = fs.readFileSync(filePath, "utf8");
    let changed = false;
    for (const { from, to, checkStr } of patches) {
        if (code.includes(checkStr || from)) {
            code = code.replace(from, to);
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(filePath, code, "utf8");
        console.log(`patch-fca: Patched ${path.basename(filePath)}`);
    } else {
        console.log(`patch-fca: ${path.basename(filePath)} already clean.`);
    }
}

const srcDir = path.join(__dirname, "node_modules", "fca-azadx69x", "src");

patchFile(path.join(srcDir, "createCommentPost.js"), [
    {
        checkStr: "const res = res.data.comment_create;",
        from: /const res = res\.data\.comment_create;\s*const info = \{\s*id: res\.feedback_comment_edge\.node\.id,\s*url: res\.feedback_comment_edge\.node\.feedback\.url,\s*count: res\.feedback\.total_comment_count/,
        to: `const commentData = res.data.comment_create;\n        const info = {\n          id: commentData.feedback_comment_edge.node.id,\n          url: commentData.feedback_comment_edge.node.feedback.url,\n          count: commentData.feedback.total_comment_count`
    }
]);

patchFile(path.join(srcDir, "createPost.js"), [
    {
        checkStr: "const res = (res[0] || res).data.link_preview;",
        from: /const res = \(res\[0\] \|\| res\)\.data\.link_preview;\s*if \(JSON\.parse\(res\.share_scrape_data\)\.share_type == 400\)\s*throw \{ error: 'url is not accepted' \}\s*\s*form\.input\.attachments\.push\(\{\s*link: \{\s*share_scrape_data: res\.share_scrape_data/,
        to: `const linkPreview = (res[0] || res).data.link_preview;\n          if (JSON.parse(linkPreview.share_scrape_data).share_type == 400) \n            throw { error: 'url is not accepted' }\n        \n          form.input.attachments.push({\n            link: {\n              share_scrape_data: linkPreview.share_scrape_data`
    }
]);

patchFile(path.join(srcDir, "unfriend.js"), [
    {
        checkStr: "const resolveFunc = function(){};",
        from: "    const resolveFunc = function(){};\n    const rejectFunc = function(){};",
        to: "    let resolveFunc = function(){};\n    let rejectFunc = function(){};"
    }
]);

console.log("patch-fca: Done.");
