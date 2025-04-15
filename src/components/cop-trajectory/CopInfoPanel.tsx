
import React from 'react';

const CopInfoPanel: React.FC = () => {
  return (
    <div className="p-3 bg-muted rounded-md text-sm">
      <h4 className="font-medium mb-1">COP Analysis:</h4>
      <ul className="list-disc pl-5 text-xs space-y-1 text-muted-foreground">
        <li>The COP trajectory shows the path of pressure center during stance phase</li>
        <li>Anteroposterior (AP) position indicates forward-backward movement</li>
        <li>Mediolateral (ML) position indicates side-to-side movement</li>
        <li>Error bars represent variation across multiple steps</li>
        <li>Compare left and right foot patterns to assess gait symmetry</li>
      </ul>
    </div>
  );
};

export default CopInfoPanel;
