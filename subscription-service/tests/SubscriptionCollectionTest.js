const chai = require('chai');
const {waterfall} = require('async');
const SubscriptionCollection = require('../model/SubscriptionCollection');

const subscriptionColl = new SubscriptionCollection();
const should = chai.should();

let subCreatedId;
let testCreatedId;

before((done) => {
  const subscription = {
    email: 'test2@example.com',
    firstName: 'name',
    gender: 'F',
    dateOfBirth: '1990-10-10',
    newsletterId: 'idCKVbyVOAivWLar',
    consentFlag: true,
  };
  subscriptionColl.createSubscription(subscription, (err, result) => {
    if (err) {
      done(err);
    } else {
      subCreatedId = result.subscriptionId;
      done();
    }
  });
});


describe('Subscriptions', () => {
  describe('Find subscriptions', () => {
    it('Find all should return all subscriptions', (done) => {
      const query = {};
      subscriptionColl.getAllSubscriptions(query, (err, res) => {
        res.subscriptions.should.be.a('array');
        done();
      });
    });

    it('Find subscription should return single subscription', (done) => {
      subscriptionColl.getSubscription(subCreatedId, (err, res) => {
        res.should.be.a('object');
        res._id.should.equal(subCreatedId);
        done();
      });
    });


    it('Find non-existent subscription should be empty', (done) => {
      const id = 'test';
      subscriptionColl.getSubscription(id, (err, res) => {
        should.not.exist(res);
        done();
      });
    });
  });

  describe('Create subscriptions', () => {
    it('Should create new subscription', (done) => {
      const subTest = {
        email: 'test3@example.com',
        firstName: 'name',
        gender: 'F',
        dateOfBirth: '1990-10-10',
        newsletterId: 'idCKVbyVOAivWLad',
        consentFlag: true,
      };
      subscriptionColl.createSubscription(subTest, (err, res) => {
        res.should.be.a('object');
        res.should.have.property('subscriptionId');
        testCreatedId = res.subscriptionId;
        done();
      });
    });

    it('Should not create subscription if it already exists', (done) => {
      const subTest = {
        email: 'test3@example.com',
        firstName: 'name',
        gender: 'F',
        dateOfBirth: '1990-10-10',
        newsletterId: 'idCKVbyVOAivWLad',
        consentFlag: true,
      };
      subscriptionColl.createSubscription(subTest, (err, res) => {
        err.should.be.a('object');
        err.error.should.equal('ALREADY_EXISTS');
        done();
      });
    });
  });

  describe('Delete subscriptions', () => {
    it('Should delete existing subscription', (done) => {
      subscriptionColl.deleteSubscription(subCreatedId, (err, res) => {
        res.should.be.a('object');
        res.countRemoved.should.equal(1);
        done();
      });
    });

    it('Should not delete non-existent subscription', (done) => {
      const id = 'test';
      subscriptionColl.deleteSubscription(id, (err, res) => {
        res.should.be.a('object');
        res.countRemoved.should.equal(0);
        done();
      });
    });
  });
});

after((done) => {
  waterfall([
    (nextW) => {
      subscriptionColl.deleteSubscription(subCreatedId, nextW);
    },
    (res, nextW) => {
      subscriptionColl.deleteSubscription(testCreatedId, nextW);
    },
  ], done);
});
