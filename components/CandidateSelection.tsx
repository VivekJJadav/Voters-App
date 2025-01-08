"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import useGetVoters from "@/app/actions/useGetVoters";
import { useSelectedOrganization } from "@/context/SelectedOrganizationContext";
import { User } from "@prisma/client";

interface CandidateSelectionProps {
  value: User[];
  onChange: (users: User[]) => void;
}

const CandidateSelection = ({ value, onChange }: CandidateSelectionProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const { selectedOrgId } = useSelectedOrganization();
  const { voters = [] } = selectedOrgId
    ? useGetVoters(selectedOrgId)
    : { voters: [] };

  const handleUnselect = React.useCallback(
    (voter: User) => {
      onChange(value.filter((s) => s.id !== voter.id));
    },
    [onChange, value]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            onChange(value.slice(0, -1));
          }
        }
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    [onChange, value]
  );

  const selectables = voters.filter(
    (voter) => !value.some((s) => s.id === voter.id)
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {value.map((voter) => {
            return (
              <Badge key={voter.id} variant="secondary">
                {voter.name}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(voter);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(voter)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={
              voters.length === 0
                ? "Please select organization"
                : "Select candidates..."
            }
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && selectables.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto">
                {selectables.map((voter) => {
                  return (
                    <CommandItem
                      key={voter.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        setInputValue("");
                        onChange([...value, voter]);
                      }}
                      className={"cursor-pointer"}
                    >
                      {voter.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  );
};

export default CandidateSelection;
