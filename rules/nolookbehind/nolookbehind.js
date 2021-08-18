/**
 * @fileoverview Rule to forbid lookbehind in a regex expression 
 * @author Szymon Danielczyk
 */

 "use strict";

 //------------------------------------------------------------------------------
 // Rule Definition
 //------------------------------------------------------------------------------
 
 module.exports = {
     meta: {
         type: "problem",
 
         docs: {
             description: "Disallow lookbehind to be used in regular expressions",
             category: "Possible Errors",
             recommended: true,
             url: ""
         },
 
         schema: [],
 
         messages: {
             unexpected: "Unexpected lookbehind in regular expressions"
         }
     },
 
     create(context) {
 
         /**
          * Get the regex expression
          * @param {ASTNode} node node to evaluate
          * @returns {RegExp|null} Regex if found else null
          * @private
          */
         function getRegExpPattern(node) {
             if (node.regex) {
                 return node.regex.pattern;
             }
             if (typeof node.value === "string" &&
                 (node.parent.type === "NewExpression" || node.parent.type === "CallExpression") &&
                 node.parent.callee.type === "Identifier" &&
                 node.parent.callee.name === "RegExp" &&
                 node.parent.arguments[0] === node
             ) {
                 return node.value;
             }
 
             return null;
         }
 
         return {
             Literal(node) {
                 const pattern = getRegExpPattern(node);
 
                 if (pattern && pattern.indexOf('?<=') > 0) {
                    context.report({
                        node,
                        messageId: "unexpected",
                        data: {
                            regularExpression: pattern
                        }
                    });
                 }
             }
         };
 
     }
 };