const { User, Thought } = require('../models');

const userController = {

    // GET all users; route /users, method get
    getAllUsers(req, res) {
        User.find({})
        .select('-__v')
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
    },

    // GET user by id, route /users/:id, method get
    getUserById({ params }, res) {
        User.findOne({ _id: params.id })
        .populate([
            { path: 'thoughts', select: "-__v" },
            { path: 'friends', select: "-__v" }
        ])
        .select('-__v')
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({message: 'No user found with this id'});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    },
 // create user, route /users, method post
    createUser({ body }, res) {
        User.create(body)
        .then(dbUserData => res.json(dbUserData))
        .catch(err => res.status(400).json(err));
    },

    // Update User, route /users/:id, method put
    // expected body
    // {
    //     "username": "user1",
    //     "email": "user1@gmail.com"  
    // }
    updateUser({ params, body }, res) {
        User.findOneAndUpdate({ _id: params.id }, body, { new: true})
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id' });
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.status(400).json(err));
    },

    // Delete user by id, route /users/:id, method delete
    deleteUser({ params }, res) {
        // delete the user
        User.findOneAndDelete({ _id: params.id })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id'});
                return;
            }
            // remove the user from friends arrays
            User.updateMany(
                { _id : {$in: dbUserData.friends } },
                { $pull: { friends: params.id } }
            )
            .then(() => {
                // remove user's thoughts
                Thought.deleteMany({ username : dbUserData.username })
                .then(() => {
                    res.json({message: "User uccessfully deleted "});
                })
                .catch(err => res.status(400).json(err));
            })
            .catch(err => res.status(400).json(err));
        })
        .catch(err => res.status(400).json(err));
    },
// CREATE Friend, route users/:userId/friends/:friendId, method post
    addFriend({ params }, res) {
        // add friendId to user with userId friend list
        User.findOneAndUpdate(
            { _id: params.userId },
            { $addToSet: { friends: params.friendId } },
            { new: true}
        )
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this userId' });
                return;
            } res.json(dbUserData);
        })
        .catch(err => res.json(err));
    },

    // DELETE Friend, route /users/:userId/friends/:friendId, method delete
    deleteFriend({ params }, res) {
        // remove friendId from user with userId friend list
        User.findOneAndUpdate(
            { _id: params.id },
            { $pull: { friends: params.friendsId } },
            { new: true }
          )
            .then((dbUserData) => {
              if (!dbUserData) {
                res.status(404).json({ message: "no user found with this ID" });
                return;
              }
              res.json({message: 'Friend successfully deleted'});
            })
            .catch((err) => res.status(400).json(err));
        },
    
}

module.exports = userController;
