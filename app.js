// import module
const express = require('express')
const mongoose = require('mongoose');
const config = require('config')
const path = require('path');
const Blog = require("./model/blog");
const cors = require('cors')

// app and database config
const app = express()
const port = 3001
const databaseURL = config.get('demoConfig.database.URL')
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

mongoose.connect(databaseURL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Database connected')
    }).catch((e) => {
        console.log(`Database connection fail, reason: ${e}`)
    })

// routes
app.get('/', async (req, res) => {
    await Blog.find({}, (err, result) => {
        if (!err) {
            res.render('home.ejs', {
                blogHeader: 'Simple Blog',
                blogs: result
            })
        } else {
            throw err
        }
    }).clone().catch((err) => {
        console.log(err)
    });
})

app.get('/get-all-blog', async(req, res) => {
    await Blog.find({}, (err, result) => {
        if (!err) {
            res.send({blog: result.data})
        } else {
            throw err
        }
    }).clone().catch((err) => {
        console.log(err)
    });
})

app.get('/about', (req,res) => {
    res.render('about.ejs', {blogHeader: 'Simple Blog',})
})

app.get('/blog/:blogId', async (req,res) => {
    console.log('id blog',req.params.blogId)
    const blogId = req.params.blogId
    if (blogId) {
        Blog.findById(blogId).lean().exec((err, result) => {
            if (err) {
                res.send('not found')
                return
            }
            try {
                console.log('result', result)
                res.render('blog.ejs', {
                    blogHeader: 'Simple Blog',
                    blog: result
                })
            } catch (err) {
                console.log('error: ',err)
            }
        })
        
    } else {
        res.send('not found')
    }
})


app.post('/add-blog', async (req, res) => {
    try {
        const newBlog = new Blog({
            title: req.body.title,
            content: req.body.content
        })

        await Blog.create(newBlog)
        res.send("Blog added")
    } catch (err) {
        console.log('error: ', err)
        res.send('error: ', err)
    }
})

app.listen(port, () => {
    console.log(`Example runing on port ${port}`)
})
