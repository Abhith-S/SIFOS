pragma solidity >=0.4.22 <0.8.0;

contract Election {

  struct Candidate {
    uint id;
    string name;
    uint totalVotes;
  }

  mapping(uint => Candidate) public candidates;
  mapping(address => bool) public voted;
  uint public totalCandidates = 0;
  mapping(address => bool) public eligible;
  uint public totalEligable = 0;

  address public owner;


    event votedEvent(
        uint indexed _candidateID
    );

    event whiteListEvent(
        address indexed voter
    );


  constructor() public {
    owner = msg.sender;

    createCandidate("Abhishek");
    createCandidate("Abhith");
    createCandidate("Arun");
    createCandidate("Edwin");

  }



  function giveVoterRights(address voter) public {
    require(
      msg.sender == owner,
      "Only the owner can give voting permissions."
    );

    require(
      !eligible[voter],
      "This address is already eligible to vote."
    );

    require(
      !voted[voter],
      "This address has already voted."
    );

    totalEligable = safeAdd(totalEligable, 1);
    eligible[voter] = true;
    emit whiteListEvent(voter);
  }


  function createCandidate(string memory _name) private {
    totalCandidates = safeAdd(totalCandidates, 1);
    candidates[totalCandidates] = Candidate(totalCandidates, _name, 0);
  }

  function vote(uint _candidateID) public {
    require(!voted[msg.sender]);
    require(eligible[msg.sender]);
    require(_candidateID > 0 && _candidateID <= totalCandidates);

    voted[msg.sender] = true;
    candidates[_candidateID].totalVotes = safeAdd(candidates[_candidateID].totalVotes, 1);

    emit votedEvent(_candidateID);

  }

  function safeAdd(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    require(c >= a, "Overflow will occur as a result of this operation");
    return c;
  }
}
