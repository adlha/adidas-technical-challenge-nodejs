const {waterfall} = require('async');
const Datastore = require('nedb');
const log = require('debug')('subscription-collection');
const db = new Datastore({filename: './data/subscriptions.db', autoload: true});


class SubscriptionCollection {
  getSubscription(subscriptionId, cb) {
    log(`Find subscription ${subscriptionId}`);
    db.findOne({_id: subscriptionId}, (err, subscription) => {
      if (err) {
        cb({error: err.message});
      } else {
        cb(null, subscription);
      }
    });
  }

  getAllSubscriptions(query, cb) {
    log(`Get all subscriptions`);
    if (query != {}) {
      db.find(query, (err, docs) => {
        if (err) {
          cb({error: err.message});
        } else {
          cb(null, {subscriptions: docs});
        }
      });
    } else {
      db.find((err, docs) => {
        if (err) {
          cb({error: err.message});
        } else {
          cb(null, {subscriptions: docs});
        }
      });
    }
  }

  createSubscription(subscription, cb) {
    log('Create subscription');
    waterfall([
      // 1. Check if subscription already exists (same email, same newsletterId)
      (next) => {
        db.find({
          email: subscription.email,
          newsletterId: subscription.newsletterId,
        }, next);
      },

      // 2. Create new subscription if it doesn't already exist
      (docs, next) => {
        if (docs.length == 0) {
          db.insert(subscription, (err, newSubscription) => {
            if (err) {
              next({error: err.message});
            } else {
              next(null, {subscriptionId: newSubscription._id});
            }
          });
        } else {
          next({
            error: 'ALREADY_EXISTS',
          });
        }
      },
    ], (err, result) => {
      cb(err, result);
    });
  }

  deleteSubscription(subscriptionId, cb) {
    log(`Delete subscription ${subscriptionId}`);
    db.remove({_id: subscriptionId}, {}, (err, n) => {
      if (err) {
        cb({error: err.message});
      } else {
        cb(null, {countRemoved: n});
      }
    });
  }
}

module.exports = SubscriptionCollection;

