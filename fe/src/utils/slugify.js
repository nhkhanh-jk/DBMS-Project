export function slugify(text) {
    return text
        .toString()
        .normalize('NFD')                   // split accented characters into their base characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, '')   // remove all the accents, which happen to be all in the \u03xx range 
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')             // replace spaces with -
        .replace(/[^\w-]+/g, '')          // remove all non-word chars
        .replace(/--+/g, '-');            // replace multiple - with single -
}
