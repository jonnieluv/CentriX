import React, { useState } from "react";
import { DollarSign, Search, Plus, UserPlus, HelpCircle, ChevronDown, Flag, Phone, Settings, MoreHorizontal, ChevronRight, Activity, Circle, Target, Users, BookOpen, UserCheck, CheckCircle, MoreVertical } from "lucide-react";
import { Ticket } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface SalesDepartmentProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  onTicketClick?: (ticket: Ticket) => void;
  onCreateDeal?: () => void;
}

interface Deal {
  id: string;
  title: string;
  org: string;
  val: string;
  stage: string;
  color: string;
  warning?: boolean;
  greyIcon?: boolean;
  alert?: boolean;
  active?: boolean;
  won?: boolean;
  ticketData?: Ticket;
}

export default function SalesDepartment({ tickets, setTickets, onTicketClick, onCreateDeal }: SalesDepartmentProps) {
  const [isPipelineDropdownOpen, setIsPipelineDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [view, setView] = useState<'kanban' | 'list' | 'activity'>('kanban');

  // Derive Deals from actual Tickets prop
  const salesTickets = tickets.filter(t => t.status === "Sales");
  
  const deals: Deal[] = salesTickets.map((t) => ({
    id: t.id,
    title: t.clientInfo.name || "Unknown Client",
    org: t.employmentDetails?.company || t.addressDetails?.street || "New Deal",
    val: `${Number(t.addressDetails?.mortgageRequired || 0).toLocaleString('fr-FR')}€`,
    stage: t.subStatus || "Contact Made",
    color: t.subStatus === "Qualified" ? "bg-blue-500" : t.subStatus === "Negotiations Started" ? "bg-green-500" : "bg-slate-300",
    warning: (t.ticketStatus === "Review"),
    active: (t.ticketStatus === "In Progress"),
    won: (t.ticketStatus === "Completed"),
    alert: false,
    greyIcon: false,
    ticketData: t
  }));

  // Pipedrive style Kanban board stages - Qualified moved to the right end
  const stages = [
    { id: "Contact Made", title: "Contact Made", color: "bg-amber-500" },
    { id: "Demo Scheduled", title: "Demo Scheduled", color: "bg-indigo-500" },
    { id: "Proposal Made", title: "Proposal Made", color: "bg-yellow-500" },
    { id: "Negotiations Started", title: "Negotiations Started", color: "bg-green-500" },
    { id: "Qualified", title: "Qualified", color: "bg-blue-500" }
  ].map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage.id);
    const stageValue = stageDeals.reduce((acc, d) => {
      const num = parseInt(d.val.replace(/[^0-9]/g, ""), 10);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    return {
      ...stage,
      count: stageDeals.length,
      value: `${stageValue.toLocaleString('fr-FR')}€`
    };
  });

  // Derive KPIs from state
  const parseVal = (valStr: string) => {
    const num = parseInt(valStr.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  const totalValue = deals.reduce((acc, deal) => acc + parseVal(deal.val), 0);
  const totalDeals = deals.length;

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    setTickets(prev => prev.map(t => t.id === draggableId ? { ...t, subStatus: destination.droppableId } : t));
  };

  const handleClickDeal = (deal: any) => {
    if (onTicketClick) {
      onTicketClick(deal.ticketData);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9fafc] dark:bg-slate-900 w-full overflow-hidden text-[12px]">
      {/* Sub-Header / Pipeline Controls */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded p-0.5 border border-slate-200 dark:border-slate-700">
             <button onClick={() => setView('kanban')} className={`px-3 py-1 rounded ${view === 'kanban' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'} font-medium`}>
               <Target className="w-4 h-4" />
             </button>
             <button onClick={() => setView('list')} className={`px-3 py-1 rounded ${view === 'list' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'} font-medium`}>
               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
             </button>
             <button onClick={() => setView('activity')} className={`px-3 py-1 rounded ${view === 'activity' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'} font-medium`}>
               <Activity className="w-4 h-4" />
             </button>
          </div>
          
          <button onClick={() => onCreateDeal?.()} className="ml-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded flex items-center gap-1 transition-colors">
            <Plus className="w-4 h-4" /> Deal
          </button>
        </div>

        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
           <span className="font-semibold text-black dark:text-white">{totalValue.toLocaleString('fr-FR')}€</span>
           <span className="text-slate-500 dark:text-slate-400">•</span>
           <span>{totalDeals} deals</span>
           
           <div className="flex items-center gap-1 ml-4 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800">
             <button className="px-3 py-1.5 flex items-center gap-2 border-r border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
               <Target className="w-4 h-4" />
               Sales pipeline
               <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
             </button>
             <button className="px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
             </button>
           </div>
           
           <div className="flex items-center gap-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800">
             <button className="px-3 py-1.5 flex items-center gap-2 font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
               <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
             </button>
           </div>
        </div>
      </div>

      {/* Kanban Board Area */}
      {view === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-2 dark:bg-slate-950 flex pb-4">
            {stages.map((stage) => {
              const stageDeals = deals.filter(d => d.stage === stage.id);
              return (
              <div key={stage.id} className="min-w-[280px] w-[280px] flex-shrink-0 flex flex-col bg-slate-100 dark:bg-slate-900 mx-1 rounded border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group h-full">
                 
                 {/* Header */}
                 <div className="bg-white dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700 relative z-10">
                   <div className="flex items-center justify-between mb-1">
                     <h4 className="font-semibold text-[13px] text-slate-800 dark:text-white truncate">{stage.title}</h4>
                     {stage.id === "Qualified" && (
                       <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full border-t-2 border-green-500 absolute rotate-45"></div>
                       </div>
                     )}
                   </div>
                   <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                     {stageDeals.reduce((sum, deal) => sum + parseVal(deal.val), 0).toLocaleString('fr-FR')}€ • {stageDeals.length} deals
                   </div>
                   <div className={`absolute top-0 left-0 w-full h-1 ${stage.color}`}></div>
                   {/* Pipedrive chevron shape indicator at right side */}
                   <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-800 rotate-45 border-r border-t border-slate-200 dark:border-slate-700 z-20 hidden"></div>
                 </div>
 
                 {/* Column Body */}
                 <Droppable droppableId={stage.id}>
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-2 space-y-2 flex-1 overflow-y-auto min-h-0 bg-slate-50 dark:bg-slate-900/50"
                      >
                        {stageDeals.map((deal, index) => (
                          <React.Fragment key={deal.id}>
                          <Draggable draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleClickDeal(deal)}
                                className={`bg-white dark:bg-slate-800 rounded border shadow-sm cursor-pointer hover:shadow-md transition-all overflow-hidden relative ${snapshot.isDragging ? 'border-blue-500 ring-2 ring-blue-500/20 z-50 shadow-xl' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'} ${deal.won ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : ''}`}
                              >
                                {/* Color handle on left */}
                                <div className={`absolute top-0 left-0 bottom-0 w-1 ${deal.color}`}></div>
                                
                                {/* Content */}
                                <div className="p-3 pl-4">
                                  <div className="flex items-start justify-between">
                                    <div className="font-semibold text-slate-800 dark:text-white leading-tight pr-4">{deal.title}</div>
                                    <div className="shrink-0 flex gap-1">
                                      {deal.warning && <div className="text-yellow-500"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.83L19.5 19H4.5L12 5.83zM11 10h2v5h-2v-5zm0 6h2v2h-2v-2z"/></svg></div>}
                                      {deal.active && <div className=" bg-green-500 rounded-full w-4 h-4 flex items-center justify-center pr-px"><ChevronRight className="w-3 h-3 text-white" /></div>}
                                      {deal.alert && <div className="bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-white font-bold text-[8px]">3D</div>}
                                      
                                      <div className={`rounded-full w-4 h-4 flex items-center justify-center ${deal.alert ? 'bg-red-500 text-white' : deal.won ? 'bg-red-500 text-white' : deal.color === 'bg-slate-300' ? 'bg-slate-300' : 'bg-green-500 text-white'}`}>
                                         {deal.greyIcon ? <ChevronRight className="w-3 h-3 text-white" /> : <ChevronRight className="w-3 h-3 text-white" />}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-slate-500 text-[11px] mt-1 pr-6 truncate">{deal.org}</div>
                                  
                                  <div className="mt-2.5 flex justify-between items-center text-[12px]">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                                      {deal.won && <span className="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">WON</span>}
                                      {deal.val}
                                    </div>
                                    <img src={`https://i.pravatar.cc/150?img=${parseInt(deal.id) + 10}`} className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700" alt="avatar" />
                                  </div>
                                </div>
                                
                                {/* Add activity line */}
                                {deal.id === "7" && (
                                  <div className="border-t border-slate-100 dark:border-slate-700/50 mt-1 pb-1 pt-1.5 px-4 text-slate-400">
                                    <span className="bg-blue-100 text-blue-600 text-[9px] font-bold px-1 rounded mr-1">AS</span> <span className="text-[11px]">1 150€</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                          </React.Fragment>
                        ))}
                        {provided.placeholder}
                        {/* Plus button at bottom of col */}
                        <div className="pt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => onCreateDeal?.()} className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium flex items-center justify-center w-full gap-1 p-1">
                             <Plus className="w-3 h-3" /> New deal
                           </button>
                        </div>
                      </div>
                    )}
                 </Droppable>
              </div>
            )})}
          </div>
        </DragDropContext>
      ) : (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          {view === 'list' ? "List View Placeholder" : "Activity View Placeholder"}
        </div>
      )}
    </div>
  );
}
