// Generated from grammar/Model.g4 by ANTLR 4.12.0
// jshint ignore: start
import antlr4 from 'antlr4';
import ModelVisitor from './ModelVisitor.js';

const serializedATN = [4,1,38,262,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,
4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,
2,13,7,13,2,14,7,14,2,15,7,15,1,0,1,0,4,0,35,8,0,11,0,12,0,36,1,1,1,1,1,
1,1,1,3,1,43,8,1,1,1,3,1,46,8,1,1,1,1,1,1,1,3,1,51,8,1,1,1,1,1,1,2,1,2,3,
2,57,8,2,1,2,1,2,1,2,3,2,62,8,2,5,2,64,8,2,10,2,12,2,67,9,2,1,3,1,3,1,3,
1,3,1,3,1,3,1,4,1,4,1,4,1,4,5,4,79,8,4,10,4,12,4,82,9,4,1,5,1,5,1,5,1,5,
1,5,1,5,1,5,3,5,91,8,5,1,6,1,6,1,6,1,6,3,6,97,8,6,1,6,3,6,100,8,6,1,6,1,
6,1,7,1,7,1,7,1,7,1,7,3,7,109,8,7,1,7,3,7,112,8,7,1,7,1,7,1,7,1,7,1,7,1,
7,1,7,1,7,1,7,5,7,123,8,7,10,7,12,7,126,9,7,3,7,128,8,7,1,8,1,8,1,8,1,8,
3,8,134,8,8,1,8,1,8,1,8,1,8,1,8,1,8,3,8,142,8,8,1,8,1,8,1,8,1,8,1,8,1,8,
1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,3,8,159,8,8,1,8,1,8,1,8,1,8,1,8,1,8,
1,8,3,8,168,8,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,1,8,
1,8,1,8,1,8,1,8,1,8,1,8,1,8,5,8,191,8,8,10,8,12,8,194,9,8,1,9,1,9,1,9,5,
9,199,8,9,10,9,12,9,202,9,9,1,10,1,10,1,10,5,10,207,8,10,10,10,12,10,210,
9,10,1,11,1,11,3,11,214,8,11,1,11,1,11,1,11,1,12,1,12,1,12,1,12,1,12,1,12,
1,12,1,13,1,13,1,13,5,13,229,8,13,10,13,12,13,232,9,13,1,14,1,14,1,14,1,
14,1,14,1,14,1,15,1,15,1,15,4,15,243,8,15,11,15,12,15,244,1,15,1,15,1,15,
4,15,250,8,15,11,15,12,15,251,1,15,1,15,4,15,256,8,15,11,15,12,15,257,3,
15,260,8,15,1,15,0,1,16,16,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,0,
5,2,0,8,8,29,30,1,0,21,22,1,0,23,24,1,0,25,28,2,0,29,29,31,31,289,0,34,1,
0,0,0,2,50,1,0,0,0,4,56,1,0,0,0,6,68,1,0,0,0,8,74,1,0,0,0,10,90,1,0,0,0,
12,92,1,0,0,0,14,103,1,0,0,0,16,167,1,0,0,0,18,195,1,0,0,0,20,203,1,0,0,
0,22,211,1,0,0,0,24,218,1,0,0,0,26,225,1,0,0,0,28,233,1,0,0,0,30,259,1,0,
0,0,32,35,3,2,1,0,33,35,3,12,6,0,34,32,1,0,0,0,34,33,1,0,0,0,35,36,1,0,0,
0,36,34,1,0,0,0,36,37,1,0,0,0,37,1,1,0,0,0,38,39,5,33,0,0,39,42,5,1,0,0,
40,43,3,4,2,0,41,43,3,16,8,0,42,40,1,0,0,0,42,41,1,0,0,0,43,45,1,0,0,0,44,
46,3,8,4,0,45,44,1,0,0,0,45,46,1,0,0,0,46,51,1,0,0,0,47,48,5,33,0,0,48,49,
5,2,0,0,49,51,5,33,0,0,50,38,1,0,0,0,50,47,1,0,0,0,51,52,1,0,0,0,52,53,5,
3,0,0,53,3,1,0,0,0,54,57,5,33,0,0,55,57,3,6,3,0,56,54,1,0,0,0,56,55,1,0,
0,0,57,65,1,0,0,0,58,61,5,4,0,0,59,62,5,33,0,0,60,62,3,6,3,0,61,59,1,0,0,
0,61,60,1,0,0,0,62,64,1,0,0,0,63,58,1,0,0,0,64,67,1,0,0,0,65,63,1,0,0,0,
65,66,1,0,0,0,66,5,1,0,0,0,67,65,1,0,0,0,68,69,5,5,0,0,69,70,5,33,0,0,70,
71,5,24,0,0,71,72,5,33,0,0,72,73,5,6,0,0,73,7,1,0,0,0,74,75,5,7,0,0,75,80,
3,10,5,0,76,77,5,4,0,0,77,79,3,10,5,0,78,76,1,0,0,0,79,82,1,0,0,0,80,78,
1,0,0,0,80,81,1,0,0,0,81,9,1,0,0,0,82,80,1,0,0,0,83,91,5,33,0,0,84,85,5,
5,0,0,85,86,5,33,0,0,86,87,5,1,0,0,87,88,3,20,10,0,88,89,5,6,0,0,89,91,1,
0,0,0,90,83,1,0,0,0,90,84,1,0,0,0,91,11,1,0,0,0,92,99,3,14,7,0,93,96,7,0,
0,0,94,97,3,16,8,0,95,97,3,30,15,0,96,94,1,0,0,0,96,95,1,0,0,0,97,100,1,
0,0,0,98,100,3,22,11,0,99,93,1,0,0,0,99,98,1,0,0,0,99,100,1,0,0,0,100,101,
1,0,0,0,101,102,5,3,0,0,102,13,1,0,0,0,103,108,5,33,0,0,104,105,5,9,0,0,
105,106,3,20,10,0,106,107,5,10,0,0,107,109,1,0,0,0,108,104,1,0,0,0,108,109,
1,0,0,0,109,111,1,0,0,0,110,112,5,11,0,0,111,110,1,0,0,0,111,112,1,0,0,0,
112,127,1,0,0,0,113,114,5,12,0,0,114,115,5,9,0,0,115,116,3,20,10,0,116,124,
5,10,0,0,117,118,5,4,0,0,118,119,5,9,0,0,119,120,3,20,10,0,120,121,5,10,
0,0,121,123,1,0,0,0,122,117,1,0,0,0,123,126,1,0,0,0,124,122,1,0,0,0,124,
125,1,0,0,0,125,128,1,0,0,0,126,124,1,0,0,0,127,113,1,0,0,0,127,128,1,0,
0,0,128,15,1,0,0,0,129,130,6,8,-1,0,130,131,5,33,0,0,131,133,5,5,0,0,132,
134,3,18,9,0,133,132,1,0,0,0,133,134,1,0,0,0,134,135,1,0,0,0,135,168,5,6,
0,0,136,141,5,33,0,0,137,138,5,9,0,0,138,139,3,20,10,0,139,140,5,10,0,0,
140,142,1,0,0,0,141,137,1,0,0,0,141,142,1,0,0,0,142,143,1,0,0,0,143,144,
5,5,0,0,144,145,3,16,8,0,145,146,5,6,0,0,146,168,1,0,0,0,147,148,5,13,0,
0,148,168,3,16,8,15,149,150,5,24,0,0,150,168,3,16,8,14,151,152,5,23,0,0,
152,168,3,16,8,13,153,158,5,33,0,0,154,155,5,9,0,0,155,156,3,20,10,0,156,
157,5,10,0,0,157,159,1,0,0,0,158,154,1,0,0,0,158,159,1,0,0,0,159,168,1,0,
0,0,160,168,5,34,0,0,161,168,5,37,0,0,162,168,3,22,11,0,163,164,5,5,0,0,
164,165,3,16,8,0,165,166,5,6,0,0,166,168,1,0,0,0,167,129,1,0,0,0,167,136,
1,0,0,0,167,147,1,0,0,0,167,149,1,0,0,0,167,151,1,0,0,0,167,153,1,0,0,0,
167,160,1,0,0,0,167,161,1,0,0,0,167,162,1,0,0,0,167,163,1,0,0,0,168,192,
1,0,0,0,169,170,10,12,0,0,170,171,5,14,0,0,171,191,3,16,8,13,172,173,10,
11,0,0,173,174,7,1,0,0,174,191,3,16,8,12,175,176,10,10,0,0,176,177,7,2,0,
0,177,191,3,16,8,11,178,179,10,9,0,0,179,180,7,3,0,0,180,191,3,16,8,10,181,
182,10,8,0,0,182,183,7,4,0,0,183,191,3,16,8,9,184,185,10,7,0,0,185,186,5,
15,0,0,186,191,3,16,8,8,187,188,10,6,0,0,188,189,5,16,0,0,189,191,3,16,8,
7,190,169,1,0,0,0,190,172,1,0,0,0,190,175,1,0,0,0,190,178,1,0,0,0,190,181,
1,0,0,0,190,184,1,0,0,0,190,187,1,0,0,0,191,194,1,0,0,0,192,190,1,0,0,0,
192,193,1,0,0,0,193,17,1,0,0,0,194,192,1,0,0,0,195,200,3,16,8,0,196,197,
5,4,0,0,197,199,3,16,8,0,198,196,1,0,0,0,199,202,1,0,0,0,200,198,1,0,0,0,
200,201,1,0,0,0,201,19,1,0,0,0,202,200,1,0,0,0,203,208,5,33,0,0,204,205,
5,4,0,0,205,207,5,33,0,0,206,204,1,0,0,0,207,210,1,0,0,0,208,206,1,0,0,0,
208,209,1,0,0,0,209,21,1,0,0,0,210,208,1,0,0,0,211,213,5,5,0,0,212,214,3,
24,12,0,213,212,1,0,0,0,213,214,1,0,0,0,214,215,1,0,0,0,215,216,3,26,13,
0,216,217,5,6,0,0,217,23,1,0,0,0,218,219,5,9,0,0,219,220,3,28,14,0,220,221,
5,24,0,0,221,222,3,28,14,0,222,223,5,10,0,0,223,224,5,4,0,0,224,25,1,0,0,
0,225,230,3,28,14,0,226,227,5,4,0,0,227,229,3,28,14,0,228,226,1,0,0,0,229,
232,1,0,0,0,230,228,1,0,0,0,230,231,1,0,0,0,231,27,1,0,0,0,232,230,1,0,0,
0,233,234,5,5,0,0,234,235,3,16,8,0,235,236,5,4,0,0,236,237,3,16,8,0,237,
238,5,6,0,0,238,29,1,0,0,0,239,242,3,16,8,0,240,241,5,4,0,0,241,243,3,16,
8,0,242,240,1,0,0,0,243,244,1,0,0,0,244,242,1,0,0,0,244,245,1,0,0,0,245,
260,1,0,0,0,246,249,3,16,8,0,247,248,5,4,0,0,248,250,3,16,8,0,249,247,1,
0,0,0,250,251,1,0,0,0,251,249,1,0,0,0,251,252,1,0,0,0,252,253,1,0,0,0,253,
254,5,17,0,0,254,256,1,0,0,0,255,246,1,0,0,0,256,257,1,0,0,0,257,255,1,0,
0,0,257,258,1,0,0,0,258,260,1,0,0,0,259,239,1,0,0,0,259,255,1,0,0,0,260,
31,1,0,0,0,30,34,36,42,45,50,56,61,65,80,90,96,99,108,111,124,127,133,141,
158,167,190,192,200,208,213,230,244,251,257,259];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class ModelParser extends antlr4.Parser {

    static grammarFileName = "Model.g4";
    static literalNames = [ null, "':'", "'<->'", "'|'", "','", "'('", "')'", 
                            "'->'", "':='", "'['", "']'", "':INTERPOLATE:'", 
                            "':EXCEPT:'", "':NOT:'", "'^'", "':AND:'", "':OR:'", 
                            "';'", null, null, null, "'*'", "'/'", "'+'", 
                            "'-'", "'<'", "'<='", "'>'", "'>='", "'='", 
                            "'=='", "'<>'", "'!'", null, null, null, null, 
                            "':NA:'" ];
    static symbolicNames = [ null, null, null, null, null, null, null, null, 
                             null, null, null, null, null, null, null, null, 
                             null, null, "Encoding", "Group", "UnitsDoc", 
                             "Star", "Div", "Plus", "Minus", "Less", "LessEqual", 
                             "Greater", "GreaterEqual", "Equal", "TwoEqual", 
                             "NotEqual", "Exclamation", "Id", "Const", "StringLiteral", 
                             "StringConst", "Keyword", "Whitespace" ];
    static ruleNames = [ "model", "subscriptRange", "subscriptDefList", 
                         "subscriptSequence", "subscriptMappingList", "subscriptMapping", 
                         "equation", "lhs", "expr", "exprList", "subscriptList", 
                         "lookup", "lookupRange", "lookupPointList", "lookupPoint", 
                         "constList" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = ModelParser.ruleNames;
        this.literalNames = ModelParser.literalNames;
        this.symbolicNames = ModelParser.symbolicNames;
    }

    sempred(localctx, ruleIndex, predIndex) {
    	switch(ruleIndex) {
    	case 8:
    	    		return this.expr_sempred(localctx, predIndex);
        default:
            throw "No predicate with index:" + ruleIndex;
       }
    }

    expr_sempred(localctx, predIndex) {
    	switch(predIndex) {
    		case 0:
    			return this.precpred(this._ctx, 12);
    		case 1:
    			return this.precpred(this._ctx, 11);
    		case 2:
    			return this.precpred(this._ctx, 10);
    		case 3:
    			return this.precpred(this._ctx, 9);
    		case 4:
    			return this.precpred(this._ctx, 8);
    		case 5:
    			return this.precpred(this._ctx, 7);
    		case 6:
    			return this.precpred(this._ctx, 6);
    		default:
    			throw "No predicate with index:" + predIndex;
    	}
    };




	model() {
	    let localctx = new ModelContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, ModelParser.RULE_model);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 34; 
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        do {
	            this.state = 34;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,0,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 32;
	                this.subscriptRange();
	                break;

	            case 2:
	                this.state = 33;
	                this.equation();
	                break;

	            }
	            this.state = 36; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        } while(_la===33);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	subscriptRange() {
	    let localctx = new SubscriptRangeContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, ModelParser.RULE_subscriptRange);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 50;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,4,this._ctx);
	        switch(la_) {
	        case 1:
	            this.state = 38;
	            this.match(ModelParser.Id);
	            this.state = 39;
	            this.match(ModelParser.T__0);
	            this.state = 42;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,2,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 40;
	                this.subscriptDefList();
	                break;

	            case 2:
	                this.state = 41;
	                this.expr(0);
	                break;

	            }
	            this.state = 45;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===7) {
	                this.state = 44;
	                this.subscriptMappingList();
	            }

	            break;

	        case 2:
	            this.state = 47;
	            this.match(ModelParser.Id);
	            this.state = 48;
	            this.match(ModelParser.T__1);
	            this.state = 49;
	            this.match(ModelParser.Id);
	            break;

	        }
	        this.state = 52;
	        this.match(ModelParser.T__2);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	subscriptDefList() {
	    let localctx = new SubscriptDefListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, ModelParser.RULE_subscriptDefList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 56;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 33:
	            this.state = 54;
	            this.match(ModelParser.Id);
	            break;
	        case 5:
	            this.state = 55;
	            this.subscriptSequence();
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	        this.state = 65;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===4) {
	            this.state = 58;
	            this.match(ModelParser.T__3);
	            this.state = 61;
	            this._errHandler.sync(this);
	            switch(this._input.LA(1)) {
	            case 33:
	                this.state = 59;
	                this.match(ModelParser.Id);
	                break;
	            case 5:
	                this.state = 60;
	                this.subscriptSequence();
	                break;
	            default:
	                throw new antlr4.error.NoViableAltException(this);
	            }
	            this.state = 67;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	subscriptSequence() {
	    let localctx = new SubscriptSequenceContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, ModelParser.RULE_subscriptSequence);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 68;
	        this.match(ModelParser.T__4);
	        this.state = 69;
	        this.match(ModelParser.Id);
	        this.state = 70;
	        this.match(ModelParser.Minus);
	        this.state = 71;
	        this.match(ModelParser.Id);
	        this.state = 72;
	        this.match(ModelParser.T__5);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	subscriptMappingList() {
	    let localctx = new SubscriptMappingListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, ModelParser.RULE_subscriptMappingList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 74;
	        this.match(ModelParser.T__6);
	        this.state = 75;
	        this.subscriptMapping();
	        this.state = 80;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===4) {
	            this.state = 76;
	            this.match(ModelParser.T__3);
	            this.state = 77;
	            this.subscriptMapping();
	            this.state = 82;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	subscriptMapping() {
	    let localctx = new SubscriptMappingContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, ModelParser.RULE_subscriptMapping);
	    try {
	        this.state = 90;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 33:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 83;
	            this.match(ModelParser.Id);
	            break;
	        case 5:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 84;
	            this.match(ModelParser.T__4);
	            this.state = 85;
	            this.match(ModelParser.Id);
	            this.state = 86;
	            this.match(ModelParser.T__0);
	            this.state = 87;
	            this.subscriptList();
	            this.state = 88;
	            this.match(ModelParser.T__5);
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	equation() {
	    let localctx = new EquationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, ModelParser.RULE_equation);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 92;
	        this.lhs();
	        this.state = 99;
	        this._errHandler.sync(this);
	        switch (this._input.LA(1)) {
	        case 8:
	        case 29:
	        case 30:
	        	this.state = 93;
	        	_la = this._input.LA(1);
	        	if(!((((_la) & ~0x1f) === 0 && ((1 << _la) & 1610612992) !== 0))) {
	        	this._errHandler.recoverInline(this);
	        	}
	        	else {
	        		this._errHandler.reportMatch(this);
	        	    this.consume();
	        	}
	        	this.state = 96;
	        	this._errHandler.sync(this);
	        	var la_ = this._interp.adaptivePredict(this._input,10,this._ctx);
	        	switch(la_) {
	        	case 1:
	        	    this.state = 94;
	        	    this.expr(0);
	        	    break;

	        	case 2:
	        	    this.state = 95;
	        	    this.constList();
	        	    break;

	        	}
	        	break;
	        case 5:
	        	this.state = 98;
	        	this.lookup();
	        	break;
	        case 3:
	        	break;
	        default:
	        	break;
	        }
	        this.state = 101;
	        this.match(ModelParser.T__2);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	lhs() {
	    let localctx = new LhsContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, ModelParser.RULE_lhs);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 103;
	        this.match(ModelParser.Id);
	        this.state = 108;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===9) {
	            this.state = 104;
	            this.match(ModelParser.T__8);
	            this.state = 105;
	            this.subscriptList();
	            this.state = 106;
	            this.match(ModelParser.T__9);
	        }

	        this.state = 111;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===11) {
	            this.state = 110;
	            this.match(ModelParser.T__10);
	        }

	        this.state = 127;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===12) {
	            this.state = 113;
	            this.match(ModelParser.T__11);
	            this.state = 114;
	            this.match(ModelParser.T__8);
	            this.state = 115;
	            this.subscriptList();
	            this.state = 116;
	            this.match(ModelParser.T__9);
	            this.state = 124;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while(_la===4) {
	                this.state = 117;
	                this.match(ModelParser.T__3);
	                this.state = 118;
	                this.match(ModelParser.T__8);
	                this.state = 119;
	                this.subscriptList();
	                this.state = 120;
	                this.match(ModelParser.T__9);
	                this.state = 126;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	        }

	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


	expr(_p) {
		if(_p===undefined) {
		    _p = 0;
		}
	    const _parentctx = this._ctx;
	    const _parentState = this.state;
	    let localctx = new ExprContext(this, this._ctx, _parentState);
	    let _prevctx = localctx;
	    const _startState = 16;
	    this.enterRecursionRule(localctx, 16, ModelParser.RULE_expr, _p);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 167;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,19,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new CallContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;

	            this.state = 130;
	            this.match(ModelParser.Id);
	            this.state = 131;
	            this.match(ModelParser.T__4);
	            this.state = 133;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if((((_la) & ~0x1f) === 0 && ((1 << _la) & 25174048) !== 0) || ((((_la - 33)) & ~0x1f) === 0 && ((1 << (_la - 33)) & 19) !== 0)) {
	                this.state = 132;
	                this.exprList();
	            }

	            this.state = 135;
	            this.match(ModelParser.T__5);
	            break;

	        case 2:
	            localctx = new LookupCallContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 136;
	            this.match(ModelParser.Id);
	            this.state = 141;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===9) {
	                this.state = 137;
	                this.match(ModelParser.T__8);
	                this.state = 138;
	                this.subscriptList();
	                this.state = 139;
	                this.match(ModelParser.T__9);
	            }

	            this.state = 143;
	            this.match(ModelParser.T__4);
	            this.state = 144;
	            this.expr(0);
	            this.state = 145;
	            this.match(ModelParser.T__5);
	            break;

	        case 3:
	            localctx = new NotContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 147;
	            this.match(ModelParser.T__12);
	            this.state = 148;
	            this.expr(15);
	            break;

	        case 4:
	            localctx = new NegativeContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 149;
	            this.match(ModelParser.Minus);
	            this.state = 150;
	            this.expr(14);
	            break;

	        case 5:
	            localctx = new PositiveContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 151;
	            this.match(ModelParser.Plus);
	            this.state = 152;
	            this.expr(13);
	            break;

	        case 6:
	            localctx = new VarContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 153;
	            this.match(ModelParser.Id);
	            this.state = 158;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,18,this._ctx);
	            if(la_===1) {
	                this.state = 154;
	                this.match(ModelParser.T__8);
	                this.state = 155;
	                this.subscriptList();
	                this.state = 156;
	                this.match(ModelParser.T__9);

	            }
	            break;

	        case 7:
	            localctx = new ConstContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 160;
	            this.match(ModelParser.Const);
	            break;

	        case 8:
	            localctx = new KeywordContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 161;
	            this.match(ModelParser.Keyword);
	            break;

	        case 9:
	            localctx = new LookupArgContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 162;
	            this.lookup();
	            break;

	        case 10:
	            localctx = new ParensContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 163;
	            this.match(ModelParser.T__4);
	            this.state = 164;
	            this.expr(0);
	            this.state = 165;
	            this.match(ModelParser.T__5);
	            break;

	        }
	        this._ctx.stop = this._input.LT(-1);
	        this.state = 192;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,21,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                if(this._parseListeners!==null) {
	                    this.triggerExitRuleEvent();
	                }
	                _prevctx = localctx;
	                this.state = 190;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,20,this._ctx);
	                switch(la_) {
	                case 1:
	                    localctx = new PowerContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, ModelParser.RULE_expr);
	                    this.state = 169;
	                    if (!( this.precpred(this._ctx, 12))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 12)");
	                    }
	                    this.state = 170;
	                    this.match(ModelParser.T__13);
	                    this.state = 171;
	                    this.expr(13);
	                    break;

	                case 2:
	                    localctx = new MulDivContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, ModelParser.RULE_expr);
	                    this.state = 172;
	                    if (!( this.precpred(this._ctx, 11))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 11)");
	                    }
	                    this.state = 173;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!(_la===21 || _la===22)) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 174;
	                    this.expr(12);
	                    break;

	                case 3:
	                    localctx = new AddSubContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, ModelParser.RULE_expr);
	                    this.state = 175;
	                    if (!( this.precpred(this._ctx, 10))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 10)");
	                    }
	                    this.state = 176;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!(_la===23 || _la===24)) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 177;
	                    this.expr(11);
	                    break;

	                case 4:
	                    localctx = new RelationalContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, ModelParser.RULE_expr);
	                    this.state = 178;
	                    if (!( this.precpred(this._ctx, 9))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 9)");
	                    }
	                    this.state = 179;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) === 0 && ((1 << _la) & 503316480) !== 0))) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 180;
	                    this.expr(10);
	                    break;

	                case 5:
	                    localctx = new EqualityContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, ModelParser.RULE_expr);
	                    this.state = 181;
	                    if (!( this.precpred(this._ctx, 8))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
	                    }
	                    this.state = 182;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!(_la===29 || _la===31)) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 183;
	                    this.expr(9);
	                    break;

	                case 6:
	                    localctx = new AndContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, ModelParser.RULE_expr);
	                    this.state = 184;
	                    if (!( this.precpred(this._ctx, 7))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
	                    }
	                    this.state = 185;
	                    this.match(ModelParser.T__14);
	                    this.state = 186;
	                    this.expr(8);
	                    break;

	                case 7:
	                    localctx = new OrContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, ModelParser.RULE_expr);
	                    this.state = 187;
	                    if (!( this.precpred(this._ctx, 6))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
	                    }
	                    this.state = 188;
	                    this.match(ModelParser.T__15);
	                    this.state = 189;
	                    this.expr(7);
	                    break;

	                } 
	            }
	            this.state = 194;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,21,this._ctx);
	        }

	    } catch( error) {
	        if(error instanceof antlr4.error.RecognitionException) {
		        localctx.exception = error;
		        this._errHandler.reportError(this, error);
		        this._errHandler.recover(this, error);
		    } else {
		    	throw error;
		    }
	    } finally {
	        this.unrollRecursionContexts(_parentctx)
	    }
	    return localctx;
	}



	exprList() {
	    let localctx = new ExprListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 18, ModelParser.RULE_exprList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 195;
	        this.expr(0);
	        this.state = 200;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===4) {
	            this.state = 196;
	            this.match(ModelParser.T__3);
	            this.state = 197;
	            this.expr(0);
	            this.state = 202;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	subscriptList() {
	    let localctx = new SubscriptListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 20, ModelParser.RULE_subscriptList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 203;
	        this.match(ModelParser.Id);
	        this.state = 208;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===4) {
	            this.state = 204;
	            this.match(ModelParser.T__3);
	            this.state = 205;
	            this.match(ModelParser.Id);
	            this.state = 210;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	lookup() {
	    let localctx = new LookupContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 22, ModelParser.RULE_lookup);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 211;
	        this.match(ModelParser.T__4);
	        this.state = 213;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===9) {
	            this.state = 212;
	            this.lookupRange();
	        }

	        this.state = 215;
	        this.lookupPointList();
	        this.state = 216;
	        this.match(ModelParser.T__5);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	lookupRange() {
	    let localctx = new LookupRangeContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 24, ModelParser.RULE_lookupRange);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 218;
	        this.match(ModelParser.T__8);
	        this.state = 219;
	        this.lookupPoint();
	        this.state = 220;
	        this.match(ModelParser.Minus);
	        this.state = 221;
	        this.lookupPoint();
	        this.state = 222;
	        this.match(ModelParser.T__9);
	        this.state = 223;
	        this.match(ModelParser.T__3);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	lookupPointList() {
	    let localctx = new LookupPointListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 26, ModelParser.RULE_lookupPointList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 225;
	        this.lookupPoint();
	        this.state = 230;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===4) {
	            this.state = 226;
	            this.match(ModelParser.T__3);
	            this.state = 227;
	            this.lookupPoint();
	            this.state = 232;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	lookupPoint() {
	    let localctx = new LookupPointContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 28, ModelParser.RULE_lookupPoint);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 233;
	        this.match(ModelParser.T__4);
	        this.state = 234;
	        this.expr(0);
	        this.state = 235;
	        this.match(ModelParser.T__3);
	        this.state = 236;
	        this.expr(0);
	        this.state = 237;
	        this.match(ModelParser.T__5);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	constList() {
	    let localctx = new ConstListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 30, ModelParser.RULE_constList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 259;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,29,this._ctx);
	        switch(la_) {
	        case 1:
	            this.state = 239;
	            this.expr(0);
	            this.state = 242; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            do {
	                this.state = 240;
	                this.match(ModelParser.T__3);
	                this.state = 241;
	                this.expr(0);
	                this.state = 244; 
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            } while(_la===4);
	            break;

	        case 2:
	            this.state = 255; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            do {
	                this.state = 246;
	                this.expr(0);
	                this.state = 249; 
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                do {
	                    this.state = 247;
	                    this.match(ModelParser.T__3);
	                    this.state = 248;
	                    this.expr(0);
	                    this.state = 251; 
	                    this._errHandler.sync(this);
	                    _la = this._input.LA(1);
	                } while(_la===4);
	                this.state = 253;
	                this.match(ModelParser.T__16);
	                this.state = 257; 
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            } while((((_la) & ~0x1f) === 0 && ((1 << _la) & 25174048) !== 0) || ((((_la - 33)) & ~0x1f) === 0 && ((1 << (_la - 33)) & 19) !== 0));
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

ModelParser.EOF = antlr4.Token.EOF;
ModelParser.T__0 = 1;
ModelParser.T__1 = 2;
ModelParser.T__2 = 3;
ModelParser.T__3 = 4;
ModelParser.T__4 = 5;
ModelParser.T__5 = 6;
ModelParser.T__6 = 7;
ModelParser.T__7 = 8;
ModelParser.T__8 = 9;
ModelParser.T__9 = 10;
ModelParser.T__10 = 11;
ModelParser.T__11 = 12;
ModelParser.T__12 = 13;
ModelParser.T__13 = 14;
ModelParser.T__14 = 15;
ModelParser.T__15 = 16;
ModelParser.T__16 = 17;
ModelParser.Encoding = 18;
ModelParser.Group = 19;
ModelParser.UnitsDoc = 20;
ModelParser.Star = 21;
ModelParser.Div = 22;
ModelParser.Plus = 23;
ModelParser.Minus = 24;
ModelParser.Less = 25;
ModelParser.LessEqual = 26;
ModelParser.Greater = 27;
ModelParser.GreaterEqual = 28;
ModelParser.Equal = 29;
ModelParser.TwoEqual = 30;
ModelParser.NotEqual = 31;
ModelParser.Exclamation = 32;
ModelParser.Id = 33;
ModelParser.Const = 34;
ModelParser.StringLiteral = 35;
ModelParser.StringConst = 36;
ModelParser.Keyword = 37;
ModelParser.Whitespace = 38;

ModelParser.RULE_model = 0;
ModelParser.RULE_subscriptRange = 1;
ModelParser.RULE_subscriptDefList = 2;
ModelParser.RULE_subscriptSequence = 3;
ModelParser.RULE_subscriptMappingList = 4;
ModelParser.RULE_subscriptMapping = 5;
ModelParser.RULE_equation = 6;
ModelParser.RULE_lhs = 7;
ModelParser.RULE_expr = 8;
ModelParser.RULE_exprList = 9;
ModelParser.RULE_subscriptList = 10;
ModelParser.RULE_lookup = 11;
ModelParser.RULE_lookupRange = 12;
ModelParser.RULE_lookupPointList = 13;
ModelParser.RULE_lookupPoint = 14;
ModelParser.RULE_constList = 15;

class ModelContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_model;
    }

	subscriptRange = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(SubscriptRangeContext);
	    } else {
	        return this.getTypedRuleContext(SubscriptRangeContext,i);
	    }
	};

	equation = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(EquationContext);
	    } else {
	        return this.getTypedRuleContext(EquationContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitModel(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class SubscriptRangeContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_subscriptRange;
    }

	Id = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(ModelParser.Id);
	    } else {
	        return this.getToken(ModelParser.Id, i);
	    }
	};


	subscriptDefList() {
	    return this.getTypedRuleContext(SubscriptDefListContext,0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	subscriptMappingList() {
	    return this.getTypedRuleContext(SubscriptMappingListContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitSubscriptRange(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class SubscriptDefListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_subscriptDefList;
    }

	Id = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(ModelParser.Id);
	    } else {
	        return this.getToken(ModelParser.Id, i);
	    }
	};


	subscriptSequence = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(SubscriptSequenceContext);
	    } else {
	        return this.getTypedRuleContext(SubscriptSequenceContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitSubscriptDefList(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class SubscriptSequenceContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_subscriptSequence;
    }

	Id = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(ModelParser.Id);
	    } else {
	        return this.getToken(ModelParser.Id, i);
	    }
	};


	Minus() {
	    return this.getToken(ModelParser.Minus, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitSubscriptSequence(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class SubscriptMappingListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_subscriptMappingList;
    }

	subscriptMapping = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(SubscriptMappingContext);
	    } else {
	        return this.getTypedRuleContext(SubscriptMappingContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitSubscriptMappingList(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class SubscriptMappingContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_subscriptMapping;
    }

	Id() {
	    return this.getToken(ModelParser.Id, 0);
	};

	subscriptList() {
	    return this.getTypedRuleContext(SubscriptListContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitSubscriptMapping(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class EquationContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_equation;
    }

	lhs() {
	    return this.getTypedRuleContext(LhsContext,0);
	};

	lookup() {
	    return this.getTypedRuleContext(LookupContext,0);
	};

	TwoEqual() {
	    return this.getToken(ModelParser.TwoEqual, 0);
	};

	Equal() {
	    return this.getToken(ModelParser.Equal, 0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	constList() {
	    return this.getTypedRuleContext(ConstListContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitEquation(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class LhsContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_lhs;
    }

	Id() {
	    return this.getToken(ModelParser.Id, 0);
	};

	subscriptList = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(SubscriptListContext);
	    } else {
	        return this.getTypedRuleContext(SubscriptListContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitLhs(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ExprContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_expr;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class CallContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	Id() {
	    return this.getToken(ModelParser.Id, 0);
	};

	exprList() {
	    return this.getTypedRuleContext(ExprListContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitCall(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.CallContext = CallContext;

class OrContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitOr(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.OrContext = OrContext;

class KeywordContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	Keyword() {
	    return this.getToken(ModelParser.Keyword, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitKeyword(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.KeywordContext = KeywordContext;

class MulDivContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        this.op = null;;
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	Star() {
	    return this.getToken(ModelParser.Star, 0);
	};

	Div() {
	    return this.getToken(ModelParser.Div, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitMulDiv(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.MulDivContext = MulDivContext;

class AddSubContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        this.op = null;;
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	Plus() {
	    return this.getToken(ModelParser.Plus, 0);
	};

	Minus() {
	    return this.getToken(ModelParser.Minus, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitAddSub(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.AddSubContext = AddSubContext;

class VarContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	Id() {
	    return this.getToken(ModelParser.Id, 0);
	};

	subscriptList() {
	    return this.getTypedRuleContext(SubscriptListContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitVar(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.VarContext = VarContext;

class ParensContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitParens(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.ParensContext = ParensContext;

class ConstContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	Const() {
	    return this.getToken(ModelParser.Const, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitConst(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.ConstContext = ConstContext;

class RelationalContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        this.op = null;;
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	Less() {
	    return this.getToken(ModelParser.Less, 0);
	};

	Greater() {
	    return this.getToken(ModelParser.Greater, 0);
	};

	LessEqual() {
	    return this.getToken(ModelParser.LessEqual, 0);
	};

	GreaterEqual() {
	    return this.getToken(ModelParser.GreaterEqual, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitRelational(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.RelationalContext = RelationalContext;

class LookupCallContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	Id() {
	    return this.getToken(ModelParser.Id, 0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	subscriptList() {
	    return this.getTypedRuleContext(SubscriptListContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitLookupCall(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.LookupCallContext = LookupCallContext;

class NotContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitNot(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.NotContext = NotContext;

class NegativeContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	Minus() {
	    return this.getToken(ModelParser.Minus, 0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitNegative(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.NegativeContext = NegativeContext;

class PositiveContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	Plus() {
	    return this.getToken(ModelParser.Plus, 0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitPositive(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.PositiveContext = PositiveContext;

class AndContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitAnd(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.AndContext = AndContext;

class EqualityContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        this.op = null;;
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	Equal() {
	    return this.getToken(ModelParser.Equal, 0);
	};

	NotEqual() {
	    return this.getToken(ModelParser.NotEqual, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitEquality(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.EqualityContext = EqualityContext;

class LookupArgContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	lookup() {
	    return this.getTypedRuleContext(LookupContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitLookupArg(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.LookupArgContext = LookupArgContext;

class PowerContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitPower(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

ModelParser.PowerContext = PowerContext;

class ExprListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_exprList;
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitExprList(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class SubscriptListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_subscriptList;
    }

	Id = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(ModelParser.Id);
	    } else {
	        return this.getToken(ModelParser.Id, i);
	    }
	};


	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitSubscriptList(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class LookupContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_lookup;
    }

	lookupPointList() {
	    return this.getTypedRuleContext(LookupPointListContext,0);
	};

	lookupRange() {
	    return this.getTypedRuleContext(LookupRangeContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitLookup(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class LookupRangeContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_lookupRange;
    }

	lookupPoint = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(LookupPointContext);
	    } else {
	        return this.getTypedRuleContext(LookupPointContext,i);
	    }
	};

	Minus() {
	    return this.getToken(ModelParser.Minus, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitLookupRange(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class LookupPointListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_lookupPointList;
    }

	lookupPoint = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(LookupPointContext);
	    } else {
	        return this.getTypedRuleContext(LookupPointContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitLookupPointList(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class LookupPointContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_lookupPoint;
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitLookupPoint(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ConstListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = ModelParser.RULE_constList;
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof ModelVisitor ) {
	        return visitor.visitConstList(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}




ModelParser.ModelContext = ModelContext; 
ModelParser.SubscriptRangeContext = SubscriptRangeContext; 
ModelParser.SubscriptDefListContext = SubscriptDefListContext; 
ModelParser.SubscriptSequenceContext = SubscriptSequenceContext; 
ModelParser.SubscriptMappingListContext = SubscriptMappingListContext; 
ModelParser.SubscriptMappingContext = SubscriptMappingContext; 
ModelParser.EquationContext = EquationContext; 
ModelParser.LhsContext = LhsContext; 
ModelParser.ExprContext = ExprContext; 
ModelParser.ExprListContext = ExprListContext; 
ModelParser.SubscriptListContext = SubscriptListContext; 
ModelParser.LookupContext = LookupContext; 
ModelParser.LookupRangeContext = LookupRangeContext; 
ModelParser.LookupPointListContext = LookupPointListContext; 
ModelParser.LookupPointContext = LookupPointContext; 
ModelParser.ConstListContext = ConstListContext; 
