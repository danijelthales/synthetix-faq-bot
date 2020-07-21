# synthetix-faq-bot
Implementation of Discord bot for answering synthetix related questions

# usage:

The bot is intended to be used in direct messaging.

If asked a question (detected by a question mark at the end), it will search for best possible match in the list of know questions.

# Known commands

**help**  
Displays the list of known commands


**list**  
Lists all known questions

**categories**  
Lists all categories of known questions


**category categoryName**  
List all known questions for a given category name, e.g. **category Staking&Minting**

**question questionNumber**  
Shows the answer to the question defined by its number, e.g. **question 7**

**search searchTerm**  
Search all known questions by given search term, e.g. **search SNX price**
