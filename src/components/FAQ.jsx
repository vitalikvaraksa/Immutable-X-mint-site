import React, { useState, Fragment } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/fancy-example.css';

export const FAQ = () => {
  const hiddenTexts = [{
        label: 'How much will it cost to mint A Rogue Rabbit?',
        value: ' It will cost 0.05 ETH + gas to mint a Rogue Rabbit.'
    },
    {
        label: 'How many Rogue Rabbits are Existing on the Blockchain ?',
        value: '9999 Rogue Rabbits are existing on the Blockchain. 3333 For Each Drop will be released in different intervals. In each drop 3000 Rabbits will be available for minting and 333 will be airdropped to the Winners of the Contests under Community. Join on Discord to Know More.'
    },
    {   
        label: 'How many Rogue Rabbits one can Mint?',
        value: 'An Individual can mint maximum up to 13 Rogue Rabbits.'
    },
    {
        label: 'How can I mint these Rabbits?',
        value: 'Rogue Rabbits can be minted on our website for the initial release. Once they sell out for each drop, you will be able to trade them at Opensea.io. You will also be able to participate in community giveaways to have a chance of winning prized undercover mints of all 3 drops.  Read Road Map to know more about the Drops.'

    },
    {
        label: 'How long after minting will my NFT be revealed?',
        value: 'Mostly it will reflect as soon as you mint. Sometimes it takes 24-48 hours until your Rogue Rabbit will be revealed on Opensea.'
    },
    {
        label: 'What are the benefits of owning a Rabbit?',
        value: 'Besides getting full commercial use rights of the Rogue Rabbit, Owners are entitled to a membership that will provide them with special perks & number of exclusive benefits of The Rabble. As we Say the Rogues never break the rabble oath.' 
    },
    {   
      label: 'Where my Minted Rogue Rabbit will be Reflected ?',
      value: 'It will be Reflected on the opensea Platform.'
    },
    {       
      label: 'What are the Plans to Giveaways and Campaigns ?',
      value: 'There are so many exciting Carrot drops planned. Do check out the roadmap to know more in detail and join in THE RABBLE Discord to know more about daily updates.'
    },
    {   
      label: 'Any Other queries on the Rabble ?',
      value: 'Hey Fellow Rogues, we are easily accessible you can get in touch with us on any of our digital platforms Provided. And You can mail us to info@Roguerabbistrabble.com'
    },

  ];

  return (
    <div id="faq">
        <div className="row">
          <div className="col-xs-12 col-md-12">
              <p className="title"> WHAT YOU GET WITH METAOPS BETA PASS </p>
              <p className="row body"> 
                <img className="col-xs-1" src="img/pointer.png"></img> 
                <span className="col-xs-11" style={{padding:'0'}}> 
                EARLY IN GAME ACCESS
                </span>
              </p>
              <p className="row body"> 
                <img className="col-xs-1" src="img/pointer.png"></img> 
                <span className="col-xs-11" style={{padding:'0'}}> 
                WHITELISTED TO BUY THE UPCOMING GAME NFTS 
                </span>
              </p>
              <p className="row body"> 
                <img className="col-xs-1" src="img/pointer.png"></img> 
                <span className="col-xs-11" style={{padding:'0'}}> 
                HITELISTED TO BUY UPCOMING GAME TOKEN 
                </span>
              </p>
              <p className="row body"> 
                <img className="col-xs-1" src="img/pointer.png"></img> 
                <span className="col-xs-11" style={{padding:'0'}}> 
                  Can be cashed in (burned) for a legendary reward based on the rarity of your pass. 
                </span>
              </p>
          </div>
        </div>

    </div>
  );
};
