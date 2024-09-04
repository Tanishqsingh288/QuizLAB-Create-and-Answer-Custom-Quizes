const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const connectiontoDB = require('./connectiontoDB');
const Quiz = require('./QuizsetSchema'); // Ensure this path matches your file structure

const app = express();
const port = 4000;

connectiontoDB();



app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'frontend')));



//Page Direction Routes
app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname,'/frontend/Landing/index.html'));
});
app.get('/landing/createquiz', (req, res) => {
    res.sendFile(path.join(__dirname,'/frontend/CreateQuiz/createquiz.html'));
});
app.get('/landing/createquiz/answerquiz', (req, res) => {
    res.sendFile(path.join(__dirname,'/frontend/AnswerQuiz/answerquiz.html'));
});
app.get('/landing/register', (req, res) => {
    res.sendFile(path.join(__dirname,'/frontend/LoginAndRegister/login.html'));
});



app.post('/savequizset', async (req, res) => {
    try {
        const title = req.body.title;
        const marks = req.body.marks;
        const questions = [];

        for (let i = 0; i < req.body['question-count']; i++) {
            const questionText = req.body[`question-text-${i}`];
            const options = [];

            for (let j = 0; j < 4; j++) {
                options.push({
                    text: req.body[`option-text-${i}-${j}`],
                    isCorrect: req.body[`option${j + 1}-${i}`] === 'on',
                });
            }

            questions.push({
                questionText,
                options,
                marks: parseInt(marks, 10),
            });
        }

        const newQuiz = {
            title,
            questions,
        };

        // Replace the existing quiz or insert a new one
        await Quiz.replaceOne({}, newQuiz, { upsert: true });

        res.send(`<script>
            alert("Quiz saved successfully.");
            window.location.href = "/landing/createquiz";
        </script>`);
    } catch (err) {
        res.status(500).send('Error saving quiz: ' + err.message);
    }
});



app.get('/api/quizzes', async (req, res) => {
    try {
        const quizzes = await Quiz.find().exec();
        res.json(quizzes); // Send the quizzes back as a response
    } catch (error) {
        res.status(500).send('Error fetching quizzes: ' + error.message);
    }
});







let questionsArray = [];

async function fetchAndProcessQuizzes() {
    try {
        const quizzes = await Quiz.find().exec(); // Fetch quizzes from database
        
        quizzes.forEach(quiz => {
            console.log(`Quiz Title: ${quiz.title}`); // Log quiz title

            quiz.questions.forEach((question) => {
                console.log(`\nQuestion: ${question.questionText}`); // Log question text

                // Create an object to hold the question and its options
                let questionObj = {
                    _id: question._id,
                    questionText: question.questionText,
                    marks: question.marks,
                    options: question.options.map(option => ({
                        _id: option._id,
                        text: option.text,
                        isCorrect: option.isCorrect
                    }))
                };

                // Add the question object to the array
                questionsArray.push(questionObj);
            });
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
    }
}

// Call the function and log questionsArray after completion
async function run() {
    await fetchAndProcessQuizzes();
    console.log(questionsArray);
}

run();

// Export the questionsArray if needed for other modules
module.exports = { questionsArray };

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
