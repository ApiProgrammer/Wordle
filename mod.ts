import InputLoop from 'https://deno.land/x/input@2.0.3/index.ts'
import { bgBrightGreen, bgBrightYellow, bgBrightBlack, brightBlack, bold } from 'https://deno.land/std@0.135.0/fmt/colors.ts'

// Get random word
const _words = await Deno.readTextFile('./valid-words.csv')
const words: string[] = _words.split(/\n|\r/)
const word = words[Math.floor(Math.random() * words.length)].split('')

// Create the array of tries
const tries: string[] = new Array(6)

/// USEFUL FUNCTIONS ///
// Write data to STDOUT
const write = async (...data: string[]) => await Deno.stdout.write(new TextEncoder().encode(data.join(' ')))
// Clear the entire STDOUT
const clear = async () => { const cmd = Deno.run({cmd: [Deno.build.os == 'windows' ? 'cls' : 'clear']}); await cmd.status(); cmd.close() }
// Clear last STDOUT's line
const clearlast = async () => await write('\x1b[1A\x1b[2K')
// Ask for a 5 letter word
const askword = async (): Promise<string>  => await new InputLoop().question('Enter a 5 letter word: ', false).then((val) => val.toLowerCase())
// Count how many times an element appears in an Arrays
// deno-lint-ignore no-explicit-any
const countelement = (array: any[], element: any) => array.filter(item => item == element).length
///                  ///

clear()
for (let i = 0; i < 6; i++) {
    // Tell if the last tried word was invalid
    let wasInvalid = false
    // Get tried word
    while (!words.includes(tries[i])) {
        if (wasInvalid) await write('[⚠️ Last word was invalid] ')

        tries[i] = (await askword()).toLowerCase()
        await clearlast()

        if (tries.indexOf(tries[i]) != i || !words.includes(tries[i])) { wasInvalid = true; continue }
    }
    
    // List already used letters
    const usedletters: Record<string, number> = {}
    // List the color that will show up in the stdout for the letters
    const letterColors: number[] = [0, 0, 0, 0, 0]

    // Check for letters that are right/green
    // deno-lint-ignore prefer-const
    for (let x in tries[i].split('')) {
        const letter = tries[i].split('')[x]
        if (word[x] == letter) {
            isNaN(usedletters[letter]) ? usedletters[letter] = 1 : usedletters[letter]++
            letterColors[x] = 2
        }
    }
    // Check for letters that are right but not in the right place/yellow
    // deno-lint-ignore prefer-const
    for (let x in tries[i].split('')) {
        const letter = tries[i].split('')[x]
        if (letterColors[x] > 0 || usedletters[letter] <= countelement(word, letter)) continue
        if (word.includes(letter)) {
            isNaN(usedletters[letter]) ? usedletters[letter] = 1 : usedletters[letter]++
            letterColors[x] = 1
        }
    }

    // Write to stdout the letters with color
    // deno-lint-ignore prefer-const
    for (let x in letterColors) {
        const letter = bold(tries[i].split('')[x].toUpperCase())
        const color = letterColors[x]
        switch (color) {
            case 2:
                await write(bgBrightGreen(` ${letter} `))
                break
            case 1:
                await write(bgBrightYellow(` ${brightBlack(letter)} `))
                break
            default:
                await write(bgBrightBlack(` ${letter} `))
        }
    }
    
    await write('\n') // Just write a new line so that the colored letters don't steal a line
    if (tries[i] == word.join('')) { await write('🎉 Congrats! you got it!!\n'); Deno.exit() } // Check if the player won! 🎉
}

await write(`Aw... you lost... maybe you can get it next time!\nThe word was: ${word.join('')}\n`) // Check if the player lost... :(
