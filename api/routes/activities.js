const express = require('express')
const route = express.Router()
const mongoose = require('mongoose')
const objActivitie = require('../models/activities')

route.get('/', (req, res, next) => {
    objActivitie.find()
        .select("name price description date")
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                product: docs.map(doc =>{
                    return{
                        name: doc.name,
                        price: doc.price,
                        description: doc.description,
                        date: doc.date,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/activities/' + doc._id
                        }
                    }
                })
            }
            docs.length >= 0 ? res.status(200).json(response) : res.status(404).json({message: 'No entries found'})
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

route.get('/:activitieId', (req, res, next) => {
    const id = req.params.activitieId
    objActivitie.findById(id)
        .select("name price description date")
        .exec()
        .then(doc => {
            doc ? res.status(200).json({
                product: doc,
                request: {
                    type: 'GET_ALL_ACT',
                    url: 'http://localhost:3000/activities/'
                }
            }) 
            : res.status(404).json({
                message: 'No valid entry found for provided ID'
            })
        })
        .catch(err => {
            res.status(500).json({error: err})
        })
})

route.post('/', (req, res, next) => {
    const activities = new objActivitie({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        date: req.body.date
    })
    activities
        .save()
        .then(result => {
            console.log(result)
            res.status(201).json({
                message: "Handling POST request to /activities",
                createdActivitie: {
                    name: result.name,
                    price: result.price,
                    description: result.description,
                    date: result.date,
                    request: {
                        type: 'POST',
                        url: 'http://localhost:3000/activities/' + result._id
                    }
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

route.patch('/:activitieId', (req, res, next) => {
    const id = req.params.activitieId
    const updateOps = {}
    for (const ops of req.body ) {
        updateOps[ops.propName] = ops.value
    }
    objActivitie.update({_id: id}, {$set: updateOps })
        .exec()
        .then(result =>{
            res.status(200).json({
                message: 'Activitie updated',
                request:{
                    type: 'GET',
                    url: `http://localhost:3000/activities/${id}`
                }
            })
        })
        .catch(err =>{
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

route.delete('/:activitieId', (req, res, next) => {
    const id = req.params.activitieId
    objActivitie.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Activitie deleted',
                request: {
                    type: 'POST',
                    url: 'https://localhost:3000/activities'
                }
            })
        })
        .catch(err =>{
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

module.exports = route