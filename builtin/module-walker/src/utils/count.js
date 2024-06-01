/**
 * @param { string } self 
 * @param { string } searchString 
 * @param { number } [position] 
 */
export function count(self, searchString, position = 0) {
    if (searchString == "") return Infinity;
    let i = 0;
    while ((position = self.indexOf(searchString, position)) !== -1) {
        position += searchString.length;
        i++;
    }
    return i;
}