const express = require('express');
const { connection, Poll } = require("./db")

require("dotenv").config()


const app = express();
app.use(express.json());

//Home Page
app.get("/",(req,res)=>{

    res.send("Home Page ")
})


// ////////////////////  Post The Poll //////////////////// 

app.post('/post/polls', async (req, res) => {
      try {
        const { title, category, startDate, endDate, minReward, maxReward } = req.body;
        const newPoll = new Poll({ title, category, startDate, endDate, minReward, maxReward });
        const savedPoll = await newPoll.save();
        res.send({ pollId: savedPoll._id, message: 'Poll created successfully.' });
      } catch (err) {
        res.status(500).json({ error: 'Error from Post data', Details:err.message });
      }
    });


    // ////////////////////  GET Polls //////////////////// 

    app.get('/get/polls', async (req, res) => {
      try {
        const polls = await Poll.find();
        
        if (polls.length === 0) {
          return res.status(404).json({ error: 'No polls found.' });
        }
    
        const formattedPolls = polls.map((poll) => {
          const totalVotes = poll.questions.reduce((acc, question) => acc + question.options.reduce((votes, option) => votes + (option.votes || 0), 0), 0);
          const numQuestionSets = poll.questions.length;
          const sampleQuestion = numQuestionSets > 0 ? poll.questions[0] : null;
    
          return {
            title: poll.title,
            category: poll.category,
            startDate: poll.startDate,
            endDate: poll.endDate,
            totalVotes,
            numQuestionSets,
            sampleQuestion,
          };
        });
    
        res.json(formattedPolls);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: ' Error from Getting data', details: err.message });
      }
    });


    // ////////////////////  Updating Polls  //////////////////// 
    
app.patch('/update/polls/:pollId', async (req, res) => {
    const ID = req.params.pollId
    const payload = req.body
    try {
        await Poll.findByIdAndUpdate({ _id: ID }, payload);
        res.json({ message: 'Poll details updated successfully.',PollId:ID });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error', "error": err.message})
       
    }
});


    // ////////////////////  detete Polls //////////////////// 

    app.delete('/delete/polls/:id', async (req, res) => {
      const ID = req.params.id;
      try {
          await Poll.findByIdAndDelete(ID);
          res.json({ message: 'Poll details delete successfully.',PollId:ID });
      } catch (error) {
          console.log(error);  
          res.status(500).json({ error: error.message });
      }
  });



    
  // ////////////////////  Make Connection //////////////////// 

app.listen(process.env.PORT, async () => {
    try {
        await connection
        console.log("DataBase Connected")
    } catch (err) {
        console.log("DataBase Not Connected")
        console.log(err)

    }
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});