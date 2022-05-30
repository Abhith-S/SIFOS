var Election = artifacts.require("./Election.sol");


contract ("Election", function(accounts){


  it("Initialise with two candidates",function(){
    return Election.deployed().then(function(instance) {
      return instance.totalCandidates();
    }).then(function(count) {
      assert.equal(count,2);
    });
  });

  it("Initialises with the correct candidate data", function() {
    return Election.deployed().then(function(instance) {
      electionInsance = instance;
      return electionInsance.candidates(1);
    }).then(function(candidate) {
      assert.equal(candidate[0], 1, "correct ID");
      assert.equal(candidate[1], "Candidate 1", "correct name");
      assert.equal(candidate[2], 0, "Initialised with zero votes");
      return electionInsance.candidates(2);
    }).then(function(candidate) {
      assert.equal(candidate[0], 2, "correct ID");
      assert.equal(candidate[1], "Candidate 2", "correct name");
      assert.equal(candidate[2], 0, "Initialised with zero votes");
    });
  });

  it("allows only owner to whitelist voters", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      return electionInstance.giveVoterRights(accounts[1], { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "an event was triggered");
      assert.equal(receipt.logs[0].event, "whiteListEvent", "the event type is correct");
      assert.equal(receipt.logs[0].args.voter, accounts[1], "the account is correct");

      return electionInstance.eligible(accounts[1]);
    }).then(function(canVote1) {
      assert.equal(canVote1, true, "account permissions logged");

      return electionInstance.giveVoterRights(accounts[0], { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.eligible(accounts[0]);
    }).then(function(canVote0) {
      assert.equal(canVote0, false, "only the owner can set permissions");
    })
  });

  it("allows a voter to cast a vote", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1;
      electionInstance.giveVoterRights(accounts[0], { from: accounts[0] })
      return electionInstance.vote(candidateId, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "an event was triggered");
      assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
      assert.equal(receipt.logs[0].args._candidateID.toNumber(), candidateId, "the candidate id is correct");
      return electionInstance.voted(accounts[0]);
    }).then(function(hasVoted) {
      assert(hasVoted, "the voter cast their vote");
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "increases the candidate's vote by the correct ammount");
    })
  });

  it("forbids invalid candidates", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.vote(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
    });
  });

  it("forbids double voting", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 2;
      electionInstance.vote(candidateId, { from: accounts[1] });
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "accepts first vote");
      // Try to vote again
      return electionInstance.vote(candidateId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
    });
  });
});
