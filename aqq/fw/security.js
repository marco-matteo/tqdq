function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>"']/g, function(m) {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return m;
        }
    });
}

module.exports = {
    escapeHTML: escapeHTML
};
