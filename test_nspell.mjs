import nspell from 'nspell'
import dictionaryVi from 'dictionary-vi'
import dictionaryEn from 'dictionary-en'

async function run() {
  const spellVi = nspell(dictionaryVi)
  spellVi.dictionary(dictionaryEn)
  
  console.log('hello:', spellVi.correct('hello'))
  console.log('world:', spellVi.correct('world'))
  console.log('thử:', spellVi.correct('thử'))
  console.log('nghiệm:', spellVi.correct('nghiệm'))
  console.log('nghiem:', spellVi.correct('nghiem'))
  console.log('saiiiii:', spellVi.correct('saiiiii'))
}

run().catch(console.error)
