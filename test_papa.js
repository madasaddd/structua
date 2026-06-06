const Papa = require('papaparse');

const csvString = `question,intro_paraphrase,intro_advantages,intro_disadvantages,intro_vocabHint1,intro_vocabHint2,intro_vocabHint3,intro_vocabHint4,intro_vocabHint5,body1_state1,body1_explain1,body1_state2,body1_explain2,body1_vocabHint1,body1_vocabHint2,body1_vocabHint3,body1_vocabHint4,body1_vocabHint5,body2_state1,body2_explain1,body2_state2,body2_explain2,body2_vocabHint1,body2_vocabHint2,body2_vocabHint3,body2_vocabHint4,body2_vocabHint5
"Some people believe that university education should be completely free for all students, regardless of their background.\\nWhat are the advantages and disadvantages of this policy?","Free higher education trends emerge.","Equal opportunities, skilled workforce.","Economic strain, lower quality.","Curriculum","Incentivize","Meritocracy","Proficiency","Surpass","Removes major student debts.","Graduates buy homes sooner.","Increases national innovation rates.","More citizens acquire degrees.","Acquisition","Aptitude","Attainment","Competence","Excel","Creates heavy tax burdens.","Governments struggle with funding.","Devalues the qualification degree.","Too many graduates look identical.","Benchmark","Criteria","Evaluate","Metric","Standardized"`;

const parsed = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true
});

console.log("Parsed Rows:", parsed.data.length);
console.log("Errors:", parsed.errors);
if (parsed.data.length > 0) {
    console.log("First Row Question:", parsed.data[0].question);
}
