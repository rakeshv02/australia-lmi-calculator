const { useState } = React;

const LMI_RATES = [
  {lvrMin:0, lvrMax:80, rate:0,      label:"No LMI required"},
  {lvrMin:80,lvrMax:85, rate:0.0077, label:"Low LMI zone"},
  {lvrMin:85,lvrMax:90, rate:0.0147, label:"Standard LMI zone"},
  {lvrMin:90,lvrMax:95, rate:0.0296, label:"High LMI zone"},
  {lvrMin:95,lvrMax:100,rate:0.0432, label:"Very high LMI zone"},
];

function getLMIRate(lvr) { return LMI_RATES.find(r=>lvr>r.lvrMin&&lvr<=r.lvrMax)||LMI_RATES[0]; }

function calcRepayment(principal, annualRate, years) {
  const r=annualRate/12, n=years*12;
  if (r===0) return principal/n;
  return principal*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
}

const fmt = n => "$"+Math.round(n).toLocaleString();
const pct = n => n.toFixed(2)+"%";

export default function AustraliaLMI() {
  const [propertyPrice,setPropertyPrice]=useState("700000");
  const [deposit,setDeposit]=useState("70000");
  const [interestRate,setInterestRate]=useState("6.0");
  const [loanTerm,setLoanTerm]=useState("30");
  const [addToLoan,setAddToLoan]=useState(true);
  const [result,setResult]=useState(null);

  const calculate = () => {
    const price=parseFloat(propertyPrice)||0, dep=parseFloat(deposit)||0;
    const ir=(parseFloat(interestRate)||6)/100, term=parseInt(loanTerm)||30;
    const loanBase=price-dep, lvr=(loanBase/price)*100;
    const lmiRateObj=getLMIRate(lvr);
    const lmiCost=loanBase*lmiRateObj.rate, lmiGST=lmiCost*0.10, totalLMI=lmiCost+lmiGST;
    const totalLoan=addToLoan?loanBase+totalLMI:loanBase;
    const monthlyRepayment=calcRepayment(totalLoan,ir,term);
    const monthlyWithoutLMI=calcRepayment(loanBase,ir,term);
    setResult({ price, dep, lvr, loanBase, lmiRateObj, lmiCost, lmiGST, totalLMI, totalLoan, monthlyRepayment, monthlyWithoutLMI, extraPerMonth:monthlyRepayment-monthlyWithoutLMI, depositShortfall:Math.max(0,price*0.20-dep), term });
  };

  const inputStyle={width:"100%",padding:"12px",border:"2px solid #fde68a",borderRadius:10,fontSize:16,boxSizing:"border-box",outline:"none"};
  const labelStyle={display:"block",fontWeight:600,marginBottom:6,color:"#333"};

  return (
    <div style={{fontFamily:"'Segoe UI',Arial,sans-serif",background:"#fffbeb",minHeight:"100vh",padding:"20px"}}>
      <div style={{maxWidth:820,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:8}}>🏠</div>
          <h1 style={{margin:0,fontSize:32,fontWeight:800,color:"#1a1a2e"}}>Australia LMI Calculator</h1>
          <p style={{margin:"8px 0 0",color:"#555",fontSize:16}}>Lenders Mortgage Insurance — find out your LMI cost before you buy</p>
        </div>

        <div style={{background:"#fff3cd",border:"1px solid #ffc107",borderRadius:12,padding:16,marginBottom:24,fontSize:14,color:"#664d03"}}>
          <strong>What is LMI?</strong> Lenders Mortgage Insurance protects the <em>lender</em> if you default. Required when your deposit is <strong>less than 20%</strong> of the property value (LVR above 80%). Despite protecting the lender, you pay the premium.
        </div>

        <div style={{background:"#fff",borderRadius:16,padding:28,boxShadow:"0 4px 24px rgba(0,0,0,0.08)",marginBottom:24}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(190px,1fr))",gap:20}}>
            <div><label style={labelStyle}>Property Price</label><div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#666",fontWeight:700}}>$</span><input type="number" value={propertyPrice} onChange={e=>setPropertyPrice(e.target.value)} style={{...inputStyle,paddingLeft:28}} /></div></div>
            <div><label style={labelStyle}>Your Deposit</label><div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#666",fontWeight:700}}>$</span><input type="number" value={deposit} onChange={e=>setDeposit(e.target.value)} style={{...inputStyle,paddingLeft:28}} /></div></div>
            <div><label style={labelStyle}>Interest Rate (%)</label><div style={{position:"relative"}}><input type="number" value={interestRate} step="0.1" onChange={e=>setInterestRate(e.target.value)} style={{...inputStyle,paddingRight:32}} /><span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#666"}}>%</span></div></div>
            <div><label style={labelStyle}>Loan Term</label><select value={loanTerm} onChange={e=>setLoanTerm(e.target.value)} style={inputStyle}><option value="25">25 years</option><option value="30">30 years</option></select></div>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:10,marginTop:16,cursor:"pointer"}}>
            <input type="checkbox" checked={addToLoan} onChange={e=>setAddToLoan(e.target.checked)} style={{width:18,height:18}} />
            <span style={{fontSize:14,color:"#333"}}>Add LMI to loan (capitalise LMI — most common)</span>
          </label>
          <button onClick={calculate} style={{width:"100%",marginTop:24,padding:"16px",background:"linear-gradient(135deg, #d97706, #b45309)",color:"#fff",border:"none",borderRadius:12,fontSize:18,fontWeight:700,cursor:"pointer"}}>Calculate LMI Cost</button>
        </div>

        {result && (
          result.lmiRateObj.rate===0 ? (
            <div style={{background:"#f0fdf4",border:"2px solid #bbf7d0",borderRadius:16,padding:28,textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:48,marginBottom:8}}>🎉</div>
              <div style={{fontSize:24,fontWeight:800,color:"#059669"}}>No LMI Required!</div>
              <div style={{fontSize:16,color:"#555",marginTop:8}}>Your LVR is {pct(result.lvr)} — below 80%, so no LMI applies.</div>
            </div>
          ) : <>
            <div style={{background:"linear-gradient(135deg, #d97706, #b45309)",borderRadius:16,padding:28,color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16,marginBottom:24}}>
              <div>
                <div style={{fontSize:13,opacity:0.8,marginBottom:4}}>LMI Premium (incl. GST)</div>
                <div style={{fontSize:48,fontWeight:900}}>{fmt(result.totalLMI)}</div>
                <div style={{fontSize:15,opacity:0.9}}>LVR: {pct(result.lvr)} — {result.lmiRateObj.label}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,opacity:0.8}}>Extra monthly repayment</div>
                <div style={{fontSize:28,fontWeight:800}}>{fmt(result.extraPerMonth)}/mo</div>
                <div style={{fontSize:13,opacity:0.8,marginTop:4}}>Over {result.term} yrs: ~{fmt(result.extraPerMonth*result.term*12)} extra</div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
              <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                <h3 style={{margin:"0 0 14px",fontSize:16,fontWeight:700,color:"#1a1a2e"}}>Full Breakdown</h3>
                {[
                  {label:"Property Price",value:fmt(result.price)},
                  {label:"Your Deposit",value:fmt(result.dep),color:"#059669"},
                  {label:"LVR",value:pct(result.lvr),color:result.lvr>90?"#dc2626":"#d97706"},
                  {label:"LMI Rate",value:pct(result.lmiRateObj.rate*100),color:"#d97706"},
                  {label:"LMI Premium (ex GST)",value:fmt(result.lmiCost)},
                  {label:"GST (10%)",value:fmt(result.lmiGST)},
                  {label:"Total LMI",value:fmt(result.totalLMI),bold:true,color:"#d97706"},
                  {label:"Monthly Repayment",value:fmt(result.monthlyRepayment),bold:true,border:true},
                ].map((row,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:row.border?"2px solid #e9ecef":"1px solid #f1f3f5"}}>
                    <span style={{fontSize:14,color:"#444",fontWeight:row.bold?700:400}}>{row.label}</span>
                    <span style={{fontSize:14,fontWeight:row.bold?700:600,color:row.color||"#222"}}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"#fff",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
                <h3 style={{margin:"0 0 14px",fontSize:16,fontWeight:700,color:"#1a1a2e"}}>💡 How to Avoid LMI</h3>
                <div style={{padding:16,background:"#f0fdf4",borderRadius:12,marginBottom:14}}>
                  <div style={{fontSize:13,color:"#166534",fontWeight:600,marginBottom:4}}>Extra deposit needed for 20%</div>
                  <div style={{fontSize:26,fontWeight:800,color:"#059669"}}>{fmt(result.depositShortfall)}</div>
                  <div style={{fontSize:13,color:"#555",marginTop:4}}>Saves {fmt(result.totalLMI)} in LMI</div>
                </div>
                {[
                  {title:"First Home Guarantee",desc:"Gov scheme: buy with 5% deposit, no LMI."},
                  {title:"Family Home Guarantee",desc:"Single parents: 2% deposit, no LMI."},
                  {title:"Guarantor Loan",desc:"Use a parent's property as security."},
                  {title:"Save to 20%",desc:"Takes longer but eliminates the premium."},
                ].map((item,i)=>(
                  <div key={i} style={{padding:"9px 0",borderBottom:"1px solid #f1f3f5"}}>
                    <div style={{fontSize:14,fontWeight:700,color:"#333",marginBottom:2}}>{item.title}</div>
                    <div style={{fontSize:13,color:"#666"}}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
